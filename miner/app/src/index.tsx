import "./style.css";

import { useState } from "preact/hooks";
import { render } from "preact";
import init, { Miner, MiningResult } from "wasm-miner";

const App = () => {
  const [status, setStatus] = useState<string>("Idle");
  const [isMining, setMining] = useState<boolean>(false);
  const [result, setResult] = useState<MiningResult>(null);
  const [data, setData] = useState<string>("Hello");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [duration, setDuration] = useState<number>(null);

  const startMining = async () => {
    setStatus("Mining...");
    setResult(null);

    // Initialize WASM
    await init();

    const miner = new Miner(data, difficulty);
    setMining(true);
    const start = performance.now();
    try {
      console.log("start mining...");
      const result = (await miner.mine_async()) as MiningResult;
      //const result = miner.mine();
      setResult(result);
      setStatus("Mining complete!");
      setDuration(performance.now() - start);
    } catch (err) {
      setStatus("Something bad happened:" + err);
    }
    setMining(false);
  };

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div class="bg-gray-800 shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-blue-400">
          🚀 WASM ₿ Miner
        </h1>

        <div class="mt-4">
          <label class="block text-gray-300">⛓️ Data to Mine:</label>
          <input
            type="text"
            class="w-full mt-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={data}
            onChange={(e) => setData(e.currentTarget.value)}
          />
        </div>

        <div class="mt-4">
          <label class="block text-gray-300">🎯 Difficulty:</label>
          <input
            type="number"
            class="w-full mt-1 p-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.currentTarget.value))}
          />
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
          {isMining ? "⏳ Mining..." : "⛏️ Start Mining"}
        </button>
        <div class="mt-4 text-center">
          <p
            class={`text-lg font-semibold ${
              isMining ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {status}
          </p>
        </div>
        {result && (
          <div class="mt-4 p-3 bg-gray-700 rounded-lg">
            <p class="text-gray-300">
              {result.iterations} iterations in {duration.toFixed(1)} ms
            </p>
            <div class="text-gray-400 font-mono break-all bg-gray-800 p-2 rounded-lg mt-2">
              {result.hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
