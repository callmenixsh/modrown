function Home() {
  return (
    <div className="space-y-4">
      <pre className="text-green-400 text-[10px] leading-tight overflow-x-auto">
        {String.raw`                                
                                  ░██                                                  
                                  ░██                                                  
░█████████████   ░███████   ░████████ ░██░████  ░███████  ░██    ░██    ░██ ░████████  
░██   ░██   ░██ ░██    ░██ ░██    ░██ ░███     ░██    ░██ ░██    ░██    ░██ ░██    ░██ 
░██   ░██   ░██ ░██    ░██ ░██    ░██ ░██      ░██    ░██  ░██  ░████  ░██  ░██    ░██ 
░██   ░██   ░██ ░██    ░██ ░██   ░███ ░██      ░██    ░██   ░██░██ ░██░██   ░██    ░██ 
░██   ░██   ░██  ░███████   ░█████░██ ░██       ░███████     ░███   ░███    ░██    ░██ 
`}
      </pre>

      <div className="border border-green-900/60 p-3 text-xs space-y-1">

        <div className="text-green-300 pl-0">
          modrown — a bulk downloader for Modrinth mods, packs, and modpacks
        </div>
                  <a
            href="https://github.com/callmenixsh/modrown"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 underline decoration-green-800 hover:text-green-200"
          >
            ./callmenixsh/modrown
          </a>
      </div>

      <div className="flex gap-2">
        <span className="text-green-400">$</span>
        <span className="text-green-600">cat quickstart.txt</span>
      </div>
      <ul className="space-y-1 text-green-600 text-xs">
        <li className="pl-3 border-l border-green-900">
          collections or modpack tab above → fill in the fields → run
        </li>
        <li className="pl-3 border-l border-green-900">
          need details on inputs and output structure? see the info tab
        </li>
      </ul>

      <div className="pt-2 border-t border-green-900/60 text-xs text-green-700 flex items-center gap-2">
        <span className="text-green-400">$</span>
                <div className="text-green-600">
          <span className="text-green-400">user</span>@<span className="text-green-400">callmenixsh</span>:~$ 
        </div>
        <span>
          <a
            href="https://github.com/callmenixsh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 underline decoration-green-800 hover:text-green-200"
          >
            whoami
          </a>
        </span>
      </div>
    </div>
  )
}

export default Home