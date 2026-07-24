import { useState } from "react";
import JSZip from "jszip";
import { runCollectionDownload, LOADER_OPTIONS } from "../lib/Modrinth.jsx";

function Collection() {
  const [collectionInput, setCollectionInput] = useState("");
  const [modVersion, setModVersion] = useState("");
  const [packVersion, setPackVersion] = useState("");
  const [loader, setLoader] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const [zipUrl, setZipUrl] = useState(null);
  const [zipName, setZipName] = useState("");

  const appendLog = (line) => setLog((prev) => [...prev, line]);

  const handleRunCollection = async () => {
    setRunning(true);
    setLog([]);
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);

    try {
      const result = await runCollectionDownload({
        collectionInput,
        modVersion,
        packVersion,
        loader,
        appendLog,
        JSZip,
      });
      if (result) {
        const { blob, rootFolder } = result;
        const url = URL.createObjectURL(blob);
        setZipUrl(url);
        setZipName(`${rootFolder}.zip`);
      }
    } catch (e) {
      appendLog(`ERROR: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3 flex flex-col">
      <div className="flex gap-2 items-center">
        <span className="text-green-400">$</span>
        <span className="text-green-600 whitespace-nowrap">collection(s):</span>
        <input
          type="text"
          className="flex-1 bg-transparent border-b border-green-800 text-green-300 placeholder-green-800 outline-none px-1"
          placeholder="5OBQuutT or https://modrinth.com/collection/5OBQuutT, comma-separated"
          value={collectionInput}
          onChange={(e) => setCollectionInput(e.target.value)}
          disabled={running}
        />
      </div>
      <div className="flex gap-2">
        <span className="text-green-400">$ </span>
        <span className="text-green-600 whitespace-nowrap">mod version: </span>
        <input
          type="text"
          className="w-150 bg-transparent border-b border-green-800 text-green-300 placeholder-green-800 outline-none px-1"
          placeholder="(e.g., `1.21.9`, `26.2`) `NA` if not applicable"
          value={modVersion}
          onChange={(e) => setModVersion(e.target.value)}
          disabled={running}
        />
      </div>
      <div className="flex gap-2">
        <span className="text-green-400">$ </span>
        <span className="text-green-600 whitespace-nowrap">packs version:</span>
        <input
          type="text"
          className="w-150 bg-transparent border-b border-green-800 text-green-300 placeholder-green-800 outline-none px-1"
          placeholder="(e.g., `1.21.9`, `26.2`) `latest` , `NA` if not applicable"
          value={packVersion}
          onChange={(e) => setPackVersion(e.target.value)}
          disabled={running}
        />
      </div>
      <div>
        <span className="text-green-400">$ </span>
        <span className="text-green-600 whitespace-nowrap">loader:</span>
        <select
          className="bg-black border-b border-green-800 text-green-300 outline-none px-1 py-0.5"
          value={loader}
          onChange={(e) => setLoader(e.target.value)}
          disabled={running}
        >
          <option value="" disabled>
            select...
          </option>
          {LOADER_OPTIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={handleRunCollection}
          disabled={running}
          className="text-xs px-3 py-1 border border-green-800 text-green-300 hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {running ? "running..." : "run"}
        </button>
      </div>
      {log.length > 0 && (
        <pre className="mt-2 max-h-100 overflow-y-auto text-green-600 text-xs whitespace-pre-wrap leading-relaxed border-t border-green-900/60 pt-2">
          {log.join("\n")}
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
  );
}

export default Collection;
