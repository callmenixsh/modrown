import { useState } from 'react'
import Home from './components/Home.jsx'
import Modpack from './components/Modpack.jsx'
import Collection from './components/Collection.jsx'
import Info from './components/Info.jsx'

function App() {
  const [count, setCount] = useState(0)
  const [activeView, setActiveView] = useState('about')

  const handleNavClick = (view) => {
    setActiveView(view)
  }

  const navItemClass = (view) =>
    `px-3 py-1.5 text-sm cursor-pointer border-r border-green-900/60 transition-colors ${
      activeView === view
        ? 'bg-green-900/30 text-green-300'
        : 'text-green-600 hover:text-green-400 hover:bg-green-900/10'
    }`

  return (
    <div className="min-h-screen  bg-black flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-7xl border border-green-900/60 rounded-md overflow-hidden shadow-[0_0_25px_-5px_rgba(34,197,94,0.25)] ">
        {/* header */}
        <div className="flex items-center justify-between px-3 py-2 bg-green-950/40 border-b border-green-900/60">
          <span className="text-xs text-green-500">modrown v0.0.0</span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-900" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-700" />
          </div>
        </div>

        <div className="bg-black">
          {/* nav */}
          <div className="flex border-b border-green-900/60">
            <div className={navItemClass('about')} onClick={() => handleNavClick('about')}>
              about
            </div>
            <div className={navItemClass('modpack')} onClick={() => handleNavClick('modpack')}>
              modpack
            </div>
            <div className={navItemClass('collection')} onClick={() => handleNavClick('collection')}>
              collection
            </div>
            
            <div className={navItemClass('info')} onClick={() => handleNavClick('info')}>
              info
            </div>
          </div>

          {/* content */}
          <div className="p-4 min-h-[320px] text-sm text-green-500">
            {activeView === 'about' && <Home />}
            {activeView === 'modpack' && <Modpack />}
            {activeView === 'collection' && <Collection />}
            {activeView === 'info' && <Info />}
          </div>
        </div>

        {/* status bar */}
        <div className="flex justify-between px-3 py-1.5 bg-green-950/40 border-t border-green-900/60 text-[10px] text-green-700">
          <span>./{activeView}</span>
        </div>
      </div>
    </div>
  )
}

export default App