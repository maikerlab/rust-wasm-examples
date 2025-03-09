import "./style.css";

import { useState, useMemo } from "preact/hooks";
import { render } from "preact";
import { useEffect } from "react";
import { MiningInput, MiningResult, MiningState } from "./types";
import MiningResultBox from "./components/MiningResultBox";

const App = () => {
  const [wasmState, setWasmState] = useState<MiningState>(MiningState.IDLE);
  const [jsState, setJsState] = useState<MiningState>(MiningState.IDLE);
  const isMining = useMemo(() => {
    return jsState == MiningState.MINING || wasmState == MiningState.MINING;
  }, [jsState, wasmState]);
  const statusText = useMemo(() => {
    return isMining ? "⏳ Mining..." : "⛏️ Start Mining";
  }, [isMining]);

  const [data, setData] = useState<string>("Hello WASM");
  const [difficulty, setDifficulty] = useState<number>(4);
  const [wasmResult, setWasmResult] = useState<MiningResult>();
  const [jsResult, setJsResult] = useState<MiningResult>();
  const miner: Worker = useMemo(
    () =>
      new Worker(new URL("./worker/wasm_worker.ts", import.meta.url), {
        type: "module",
      }),
    []
  );
  const jsMiner: Worker = useMemo(
    () =>
      new Worker(new URL("./worker/js_worker.ts", import.meta.url), {
        type: "module",
      }),
    []
  );

  useEffect(() => {
    if (window.Worker) {
      miner.onmessage = (e: MessageEvent<string>) => {
        const result = JSON.parse(e.data) as MiningResult;
        setWasmResult(result);
        setWasmState(MiningState.SUCCESS);
      };

      jsMiner.onmessage = (e: MessageEvent<string>) => {
        const result = JSON.parse(e.data) as MiningResult;
        setJsResult(result);
        setJsState(MiningState.SUCCESS);
      };
    }
  }, [miner, jsMiner]);

  const startMining = async () => {
    setWasmResult(null);
    setJsResult(null);
    setWasmState(MiningState.MINING);
    setJsState(MiningState.MINING);
    miner.postMessage(JSON.stringify({ data, difficulty } as MiningInput));
    jsMiner.postMessage(JSON.stringify({ data, difficulty } as MiningInput));
  };

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div class="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-3xl">
        <h1 class="text-2xl font-bold text-center text-blue-400">🚀 ₿ Miner</h1>

        <div class="mt-4">
          <label class="block text-gray-300">⛓️ Data to mine:</label>
          <input
            type="text"
            class="w-full mt-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={data}
            onChange={(e) => setData(e.currentTarget.value)}
            disabled={isMining}
          />
        </div>

        <div class="mt-4">
          <label class="block text-gray-300">🎯 Difficulty:</label>
          <div class="grid grid-cols-12 gap-x-4 w-full">
            <p class="flex items-center justify-center col-span-1">
              {difficulty}
            </p>
            <input
              class="col-span-11 mt-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
              type="range"
              min="1"
              max="10"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.currentTarget.value))}
              disabled={isMining}
            />
          </div>
        </div>

        <button
          class={`w-full mt-6 py-2 text-lg font-bold text-white rounded-lg transition-all ${
            isMining
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          }`}
          onClick={startMining}
          disabled={isMining}
        >
          {statusText}
        </button>
        <div class="flex flex-row gap-x-2">
          <MiningResultBox
            state={wasmState}
            result={wasmResult}
            title="WebAssembly"
          />
          <MiningResultBox
            state={jsState}
            result={jsResult}
            title="JavaScript"
          />
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
