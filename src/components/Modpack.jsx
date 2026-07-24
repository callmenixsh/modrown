import { useState } from 'react'
import JSZip from 'jszip'
import { runModpackDownload } from '../lib/Modrinth.jsx'

function Modpack() {
  const [modpackUrl, setModpackUrl] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const [zipUrl, setZipUrl] = useState(null)
  const [zipName, setZipName] = useState('')

  const appendLog = (line) => setLog((prev) => [...prev, line])

  const handleRun = async () => {
    setRunning(true)
    setLog([])
    if (zipUrl) URL.revokeObjectURL(zipUrl)
    setZipUrl(null)

    try {
      const result = await runModpackDownload({ modpackUrl, appendLog, JSZip })
      if (result) {
        const { blob, rootFolder } = result
        const url = URL.createObjectURL(blob)
        setZipUrl(url)
        setZipName(`${rootFolder}.zip`)
      }
    } catch (e) {
      appendLog(`ERROR: ${e.message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <span className="text-green-400">$</span>
        <span className="text-green-600 whitespace-nowrap">modpack version url:</span>
        <input
          type="text"
          className="flex-1 bg-transparent border-b border-green-800 text-green-300 placeholder-green-800 outline-none px-1"
          placeholder="(e.g., `https://modrinth.com/modpack/fabulously-optimized/version/14.0.0-beta.2`)"
          value={modpackUrl}
          onChange={(e) => setModpackUrl(e.target.value)}
          disabled={running}
        />
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="text-xs px-3 py-1 border border-green-800 text-green-300 hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {running ? 'running...' : 'run'}
      </button>

      {log.length > 0 && (
        <pre className="mt-2 max-h-56 overflow-y-auto text-green-600 text-xs whitespace-pre-wrap leading-relaxed border-t border-green-900/60 pt-2">
          {log.join('\n')}
        </pre>
      )}

      {zipUrl && (
        <a
          href={zipUrl}
          download={zipName}
          className="inline-block text-xs px-3 py-1 border border-green-700 text-green-300 hover:bg-green-900/30 transition-colors"
        >
          download {zipName}
        </a>
      )}
    </div>
  )
}

export default Modpack