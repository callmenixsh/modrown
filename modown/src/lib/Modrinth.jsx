// ---------------------------------------------------------------------------
// Modrinth client + helpers (ported from the Python script)
// ---------------------------------------------------------------------------

// Dropdown options for the loader select
export const modrinth = {
  async get(path) {
    const res = await fetch(`https://api.modrinth.com${path}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  getProject(id) {
    return this.get(`/v2/project/${id}`)
  },
  getVersions(id) {
    return this.get(`/v2/project/${id}/version`)
  },
  getCollection(id) {
    return this.get(`/v3/collection/${id}`)
  },
}

export function extractCollectionId(input) {
  const match = input.match(/(?:https?:\/\/)?(?:www\.)?modrinth\.com\/collection\/([^/?]+)/)
  return match ? match[1] : input.trim()
}

export function parseCollectionList(raw) {
  if (!raw) return []
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map(extractCollectionId)
}

// Resourcepacks, shaders, datapacks, and plugins don't run on a mod loader (fabric/forge/etc).
// Modrinth tags their versions with loader "minecraft"/"iris"/"optifine" (packs/shaders) or
// "bukkit"/"spigot"/"paper"/"purpur" (plugins) instead, so filtering them by the user's chosen
// mod loader would always fail. They're also generally forward/backward compatible, so we let
// the user ask for "latest" instead of pinning to a specific MC version.
const LOADERLESS_PROJECT_TYPES = new Set(['resourcepack', 'shader', 'datapack', 'plugin'])

// Dropdown options for the loader select
export const LOADER_OPTIONS = ['fabric', 'forge', 'neoforge', 'quilt']

const FOLDER_BY_PROJECT_TYPE = {
  mod: 'mods',
  resourcepack: 'resourcepacks',
  shader: 'shaders',
  datapack: 'datapacks',
  plugin: 'plugins',
}

export function folderForProjectType(projectType) {
  return FOLDER_BY_PROJECT_TYPE[projectType] || 'mods'
}

function isLatestKeyword(value) {
  return (value || '').trim().toLowerCase() === 'latest'
}

function newestVersion(versions) {
  return versions
    .slice()
    .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))[0]
}

export function getLatestVersion(versions, { modVersion, packVersion, loader, projectType }) {
  if (LOADERLESS_PROJECT_TYPES.has(projectType)) {
    if (isLatestKeyword(packVersion)) {
      return newestVersion(versions)
    }
    return versions.find((v) => (v.game_versions || []).includes(packVersion))
  }
  return versions.find(
    (v) => (v.game_versions || []).includes(modVersion) && (v.loaders || []).includes(loader)
  )
}

export async function getProjectInfo(modId) {
  try {
    const project = await modrinth.getProject(modId)
    return { name: project.title || project.slug || modId, projectType: project.project_type }
  } catch {
    return { name: modId, projectType: undefined }
  }
}

export function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
}

export async function downloadModRecursive(modId, ctx, isDependency = false, parentId = null) {
  const { modVersion, packVersion, loader, zip, rootFolder, processed, stats, failedMods, appendLog } = ctx
  if (processed.has(modId)) return
  processed.add(modId)

  const prefix = isDependency ? '  [DEPENDENCY] ' : ''

  try {
    const { name, projectType } = await getProjectInfo(modId)
    const display = name !== modId ? `${name} (${modId})` : modId
    const isLoaderless = LOADERLESS_PROJECT_TYPES.has(projectType)

    const versions = await modrinth.getVersions(modId)
    const latest = getLatestVersion(versions, { modVersion, packVersion, loader, projectType })

    if (!latest) {
      const loaderNote = isLoaderless
        ? `MC_VERSION=${packVersion} (no loader required for ${projectType})`
        : `MC_VERSION=${modVersion} and LOADER=${loader}`
      appendLog(`${prefix}ERROR: No version found for ${display} with ${loaderNote}`)
      stats.failed++
      failedMods.push(display)
      return
    }

    const requiredDeps = (latest.dependencies || []).filter((d) => d.dependency_type === 'required')
    if (requiredDeps.length && !isDependency) {
      appendLog(`Processing ${requiredDeps.length} required dependency(ies) for ${display}...`)
    }
    for (const dep of requiredDeps) {
      if (!dep.project_id) continue
      await downloadModRecursive(dep.project_id, ctx, true, modId)
    }

    const fileToDownload = (latest.files || []).find((f) => f.primary) || (latest.files || [])[0]
    if (!fileToDownload) {
      appendLog(`${prefix}ERROR: Couldn't find a file to download for ${display}`)
      stats.failed++
      failedMods.push(display)
      return
    }

    const loaders = (latest.loaders || []).join(', ')
    const gameVersions = (latest.game_versions || []).join(', ')
    const folder = folderForProjectType(projectType)
    appendLog(
      `${prefix}DOWNLOADING: ${display} -> ${folder}/${fileToDownload.filename} (loaders: ${loaders}, versions: ${gameVersions})`
    )

    const res = await fetch(fileToDownload.url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    zip.file(`${rootFolder}/${folder}/${fileToDownload.filename}`, blob)

    stats.downloaded++
  } catch (e) {
    appendLog(`${prefix}ERROR: Failed to process ${modId}: ${e.message}`)
    stats.failed++
    failedMods.push(modId)
  }
}

export async function runCollectionDownload({
  collectionInput,
  modVersion,
  packVersion,
  loader,
  appendLog,
  JSZip,
}) {
  const collectionIds = parseCollectionList(collectionInput)
  if (!collectionIds.length || !modVersion.trim() || !packVersion.trim() || !loader.trim()) {
    appendLog('ERROR: collection, mod version, pack version, and loader are all required')
    return null
  }

  const zip = new JSZip()
  const rootFolder = `collections_${formatTimestamp()}`
  const allMods = []
  const seen = new Set()
  let collectionsProcessed = 0

  for (const cid of collectionIds) {
    let details
    try {
      details = await modrinth.getCollection(cid)
    } catch {
      appendLog(`ERROR: Collection id=${cid} not found or inaccessible - skipping`)
      continue
    }
    const projects = details.projects || []
    if (!projects.length) {
      appendLog(`WARNING: Collection ${cid} contains no project(s)`)
      continue
    }
    appendLog(`Found ${projects.length} project(s) in collection "${details.name || cid}" (${cid})`)
    collectionsProcessed++
    for (const pid of projects) {
      if (!seen.has(pid)) {
        seen.add(pid)
        allMods.push(pid)
      }
    }
  }

  if (!collectionsProcessed) {
    appendLog('ERROR: None of the specified collections could be found or contained project(s)')
    return null
  }

  const stats = { downloaded: 0, failed: 0 }
  const failedMods = []
  const processed = new Set()
  const ctx = { modVersion, packVersion, loader, zip, rootFolder, processed, stats, failedMods, appendLog }

  // concurrency-limited pool, mirroring ThreadPoolExecutor(max_workers=5)
  const concurrency = 5
  let idx = 0
  async function worker() {
    while (idx < allMods.length) {
      const i = idx++
      await downloadModRecursive(allMods[i], ctx)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))

  appendLog('')
  appendLog('='.repeat(50))
  appendLog('SUMMARY')
  appendLog('='.repeat(50))
  appendLog(`Total mods and dependencies processed: ${stats.downloaded + stats.failed}`)
  appendLog(`Downloaded: ${stats.downloaded}`)
  appendLog(`Failed: ${stats.failed}`)
  if (failedMods.length) {
    appendLog('Failed mods:')
    failedMods.forEach((m) => appendLog(`  - ${m}`))
  }

  if (stats.downloaded > 0) {
    const blob = await zip.generateAsync({ type: 'blob' })
    return { blob, rootFolder }
  }
  return null
}

// ---------------------------------------------------------------------------
// Modpack (.mrpack) download
// ---------------------------------------------------------------------------

export function parseModpackVersionUrl(input) {
  const trimmed = (input || '').trim()
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?modrinth\.com\/modpack\/([^/?]+)\/version\/([^/?]+)/
  )
  if (urlMatch) {
    return { slug: urlMatch[1], versionNumber: urlMatch[2] }
  }
  // fallback: "slug/version" shorthand
  const parts = trimmed.split('/version/')
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { slug: parts[0].trim(), versionNumber: parts[1].trim() }
  }
  return null
}

async function findModpackVersion(slug, versionNumber) {
  const versions = await modrinth.getVersions(slug)
  const target = versionNumber.trim().toLowerCase()
  return versions.find((v) => (v.version_number || '').trim().toLowerCase() === target)
}

export async function runModpackDownload({ modpackUrl, appendLog, JSZip }) {
  const parsed = parseModpackVersionUrl(modpackUrl)
  if (!parsed) {
    appendLog('ERROR: could not parse modpack version URL. Expected format:')
    appendLog('  https://modrinth.com/modpack/{slug}/version/{version}')
    return null
  }
  const { slug, versionNumber } = parsed

  let project
  try {
    project = await modrinth.getProject(slug)
  } catch {
    appendLog(`ERROR: project "${slug}" not found`)
    return null
  }

  const version = await findModpackVersion(slug, versionNumber)
  if (!version) {
    appendLog(`ERROR: version "${versionNumber}" not found for ${project.title || slug}`)
    return null
  }

  const mrpackFile =
    (version.files || []).find((f) => f.primary) ||
    (version.files || []).find((f) => f.filename?.endsWith('.mrpack')) ||
    (version.files || [])[0]

  if (!mrpackFile) {
    appendLog('ERROR: no downloadable file found on this version')
    return null
  }

  appendLog(`Found ${project.title || slug} version ${version.version_number}`)
  appendLog(`Downloading pack file: ${mrpackFile.filename}`)

  const res = await fetch(mrpackFile.url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const mrpackBlob = await res.blob()

  const inner = await JSZip.loadAsync(mrpackBlob)
  const indexEntry = inner.file('modrinth.index.json')
  if (!indexEntry) {
    appendLog('ERROR: modrinth.index.json not found inside .mrpack — malformed pack')
    return null
  }
  const index = JSON.parse(await indexEntry.async('text'))
  const files = index.files || []

  appendLog(`Pack targets Minecraft ${index.dependencies?.minecraft || '?'}`)
  appendLog(`Resolving ${files.length} file(s) from manifest...`)

  const rootFolder = `modpack_${slug}_${version.version_number}_${formatTimestamp()}`
  const outZip = new JSZip()
  const stats = { downloaded: 0, failed: 0 }
  const failed = []

  const concurrency = 5
  let idx = 0
  async function worker() {
    while (idx < files.length) {
      const i = idx++
      const f = files[i]
      try {
        const url = (f.downloads || [])[0]
        if (!url) throw new Error('no download url')
        const fr = await fetch(url)
        if (!fr.ok) throw new Error(`HTTP ${fr.status}`)
        const blob = await fr.blob()
        outZip.file(`${rootFolder}/${f.path}`, blob)
        stats.downloaded++
      } catch (e) {
        appendLog(`ERROR: failed to download ${f.path}: ${e.message}`)
        stats.failed++
        failed.push(f.path)
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))

  // merge overrides / client-overrides into the pack root
  let overridesCount = 0
  const overridePrefixes = ['overrides/', 'client-overrides/']
  const innerEntries = Object.values(inner.files)
  for (const entry of innerEntries) {
    if (entry.dir) continue
    const prefix = overridePrefixes.find((p) => entry.name.startsWith(p))
    if (!prefix) continue
    const relPath = entry.name.slice(prefix.length)
    if (!relPath) continue
    const blob = await entry.async('blob')
    outZip.file(`${rootFolder}/${relPath}`, blob)
    overridesCount++
  }
  if (overridesCount) appendLog(`Merged ${overridesCount} override file(s)`)

  appendLog('')
  appendLog('='.repeat(50))
  appendLog('SUMMARY')
  appendLog('='.repeat(50))
  appendLog(`Files downloaded: ${stats.downloaded}`)
  appendLog(`Files failed: ${stats.failed}`)
  if (failed.length) {
    appendLog('Failed files:')
    failed.forEach((p) => appendLog(`  - ${p}`))
  }

  if (stats.downloaded > 0) {
    const blob = await outZip.generateAsync({ type: 'blob' })
    return { blob, rootFolder }
  }
  return null
}