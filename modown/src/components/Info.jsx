function Help() {

  return (
    <div className="space-y-4">
      <pre className="text-green-400 text-[10px] sm:text-xs leading-tight overflow-x-auto">
{String.raw`
                   .___                           
  _____   ____   __| _/______  ______  _  ______  
 /     \ /  _ \ / __ |\_  __ \/  _ \ \/ \/ /    \ 
|  Y Y  (  <_> ) /_/ | |  | \(  <_> )     /   |  \
|__|_|  /\____/\____ | |__|   \____/ \/\_/|___|  /
      \/            \/                         \/ 
`}
      </pre>

      <div className="flex gap-2">
        <span className="text-green-400">$</span>
        <span>info modrown</span>
      </div>

      <div className="border border-green-900/60 p-3 space-y-4 text-green-300 text-xs leading-relaxed">
        <section>
          <div className="text-green-400 font-bold">NAME</div>
          <div className="pl-4">modrown — bulk-download mods, resourcepacks, shaders, datapacks, plugins, and modpacks from Modrinth</div>
        </section>

        <section>
          <div className="text-green-400 font-bold">TABS</div>
          <div className="pl-4 space-y-2">
            <div>
              <span className="text-green-300">collection</span>
              <span className="text-green-700"> — download every project in one or more Modrinth collections</span>
              <div className="pl-4 text-green-700">
                {'>'} input: collection id(s) or url(s), comma-separated{'\n'}
                {'>'} input: mod version (e.g. 1.21.9) — applies to loader-bound projects{'\n'}
                {'>'} input: pack version — applies to resourcepacks/shaders/datapacks/plugins,{'\n'}
                {'  '}accepts "latest" to grab the newest release regardless of MC version{'\n'}
                {'>'} input: loader — select from dropdown (fabric/forge/neoforge/quilt)
              </div>
            </div>
            <div>
              <span className="text-green-300">modpack</span>
              <span className="text-green-700"> — download a single modpack at an exact version</span>
              <div className="pl-4 text-green-700">
                {'>'} input: full version url, e.g.{'\n'}
                {'  '}https://modrinth.com/modpack/fabulously-optimized/version/14.0.0-beta.2{'\n'}
                {'>'} unpacks the .mrpack manifest, resolves every file, merges overrides
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-green-400 font-bold">OUTPUT</div>
          <div className="pl-4 text-green-700">
            collection → collections_&#123;timestamp&#125;/{'\n'}
            {'  '}├── mods/{'\n'}
            {'  '}├── resourcepacks/{'\n'}
            {'  '}├── shaders/{'\n'}
            {'  '}├── datapacks/{'\n'}
            {'  '}└── plugins/{'\n\n'}
            modpack → modpack_&#123;slug&#125;_&#123;version&#125;_&#123;timestamp&#125;/{'\n'}
            {'  '}├── mods/, config/, ... (as defined by the pack manifest){'\n'}
            {'  '}└── overrides merged into pack root
          </div>
        </section>

        <section>
          <div className="text-green-400 font-bold">NOTES</div>
          <div className="pl-4 text-green-700">
            {'>'} required dependencies are resolved and pulled in automatically{'\n'}
            {'>'} failed downloads are logged individually and listed in the run summary{'\n'}
            {'>'} up to 5 downloads run concurrently per batch
          </div>
        </section>

        <section>
          <div className="text-green-400 font-bold">EXIT STATUS</div>
          <div className="pl-4 text-green-700">
            zip is only produced if at least one file downloaded successfully
          </div>
        </section>
      </div>

      <div className="flex gap-2">
        <span className="text-green-400">$</span>
        <span className="text-green-800 animate-pulse">_</span>
      </div>
    </div>
  )
}

export default Help