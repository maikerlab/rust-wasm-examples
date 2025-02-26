import "./style.css";

import { useState, useMemo } from "preact/hooks";
import { render } from "preact";
import { useEffect } from "react";
import { MiningInput, MiningResult } from "./types";

interface MiningResultBoxProps {
  title: string;
  result: MiningResult;
}
function MiningResultBox({ title, result }: MiningResultBoxProps) {
  return (
    <div class="mt-4 p-3 bg-gray-700 rounded-lg">
      <p class="text-gray-300">
        {`${title}: ${
          result.iterations
        } iterations in ${result.durationMs.toFixed(1)} ms`}
      </p>
      <div class="text-gray-400 font-mono break-all bg-gray-800 p-2 rounded-lg mt-2">
        {result.hash}
      </div>
    </div>
  );
}

const App = () => {
  const [isWasmMining, setWasmMining] = useState<boolean>(false);
  const [isJsMining, setJsMining] = useState<boolean>(false);
  const isMining = useMemo(() => {
    return isJsMining || isWasmMining;
  }, [isJsMining, isWasmMining]);
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
        setWasmMining(false);
      };

      jsMiner.onmessage = (e: MessageEvent<string>) => {
        const result = JSON.parse(e.data) as MiningResult;
        setJsResult(result);
        setJsMining(false);
      };
    }
  }, [miner, jsMiner]);

  const startMining = async () => {
    setWasmResult(null);
    setJsResult(null);
    setWasmMining(true);
    setJsMining(true);
    miner.postMessage(JSON.stringify({ data, difficulty } as MiningInput));
    jsMiner.postMessage(JSON.stringify({ data, difficulty } as MiningInput));
  };

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div class="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-blue-400">🚀 ₿ Miner</h1>

        <div class="mt-4">
          <label class="block text-gray-300">⛓️ Data to mine:</label>
          <input
            type="text"
            class="w-full mt-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={data}
            onChange={(e) => setData(e.currentTarget.value)}
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
        {wasmResult && <MiningResultBox result={wasmResult} title="WASM" />}
        {jsResult && <MiningResultBox result={jsResult} title="JS" />}
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
