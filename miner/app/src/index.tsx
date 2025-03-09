import { useState, useMemo, useRef } from "preact/hooks";
import { render } from "preact";
import { useEffect } from "react";
import { MiningInput, MiningResult, MiningState } from "./types";
import MiningResultBox from "./components/MiningResultBox";
import MiningResultChart, {
  MiningChartData,
} from "./components/MiningResultChart";

const App = () => {
  const [wasmState, setWasmState] = useState<MiningState>(MiningState.IDLE);
  const [jsState, setJsState] = useState<MiningState>(MiningState.IDLE);
  const isMining = useMemo(() => {
    return jsState == MiningState.MINING || wasmState == MiningState.MINING;
  }, [jsState, wasmState]);
  const startBtnText = useMemo(() => {
    return isMining ? "⏳ Mining..." : "⛏️ Start Mining";
  }, [isMining]);

  const [data, setData] = useState<string>("Hello WASM");
  const [difficulty, setDifficulty] = useState<number>(4);
  const [wasmResult, setWasmResult] = useState<MiningResult>();
  const [jsResult, setJsResult] = useState<MiningResult>();
  const [chartData, setChartData] = useState<MiningChartData[]>([]);

  const calcIterationsPerSecond = (iterations: number, durationMs: number) => {
    return Math.floor(Number(iterations) / (durationMs / 1000));
  };

  useEffect(() => {
    if (jsState == MiningState.SUCCESS || wasmState == MiningState.SUCCESS) {
      const newChartData: MiningChartData = {
        idx: chartData.length + 1,
        label: "WASM",
        wasm: calcIterationsPerSecond(
          Number(wasmResult.iterations),
          wasmResult.durationMs,
        ),
        js: calcIterationsPerSecond(
          Number(jsResult.iterations),
          jsResult.durationMs,
        ),
      };
      setChartData([...chartData, newChartData].slice(-100));
    }
  }, [isMining]);

  const miner: Worker = useMemo(
    () =>
      new Worker(new URL("./worker/wasm_worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
  );
  const jsMiner: Worker = useMemo(
    () =>
      new Worker(new URL("./worker/js_worker.ts", import.meta.url), {
        type: "module",
      }),
    [],
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
    miner.postMessage(
      JSON.stringify({
        data,
        difficulty,
      } as MiningInput),
    );
    jsMiner.postMessage(
      JSON.stringify({
        data,
        difficulty,
      } as MiningInput),
    );
  };

  const resetResults = () => {
    setWasmResult(null);
    setJsResult(null);
    setWasmState(MiningState.IDLE);
    setJsState(MiningState.IDLE);
    setChartData([]);
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div class="w-full max-w-3xl rounded-2xl bg-gray-800 p-6 shadow-lg">
        <h1 class="text-center text-2xl font-bold text-blue-400">🚀 ₿ Miner</h1>

        <div class="mt-4">
          <label class="block text-gray-300">⛓️ Data to mine:</label>
          <input
            type="text"
            class={`${isMining ? "cursor-not-allowed" : "cursor-text"} mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white hover:bg-gray-600 focus:ring-2 focus:ring-blue-500`}
            value={data}
            onChange={(e) => setData(e.currentTarget.value)}
            disabled={isMining}
          />
        </div>

        <div class="mt-4">
          <label class="block text-gray-300">🎯 Difficulty:</label>
          <div class="grid w-full grid-cols-12 gap-x-4">
            <p class="col-span-1 flex items-center justify-center">
              {difficulty}
            </p>
            <input
              class={`col-span-11 mt-1 rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:ring-2 focus:ring-blue-500 ${
                isMining ? "cursor-not-allowed" : "cursor-pointer"
              }`}
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
          class={`mt-2 w-full rounded-lg py-2 text-center text-lg font-bold text-white transition-all ${
            isMining
              ? "cursor-not-allowed bg-gray-600"
              : "cursor-pointer bg-blue-500 hover:bg-blue-700"
          }`}
          onClick={startMining}
          disabled={isMining}
        >
          {startBtnText}
        </button>
        <div class="mt-2 flex flex-row gap-x-2">
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
        <button
          class={`mt-2 w-full rounded-lg bg-gray-700 py-2 text-center text-lg font-bold text-white transition-all hover:bg-gray-600 ${
            isMining ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={resetResults}
          disabled={isMining}
        >
          Clear Results
        </button>
        <div class="my-4 flex w-full items-center justify-center">
          <MiningResultChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
