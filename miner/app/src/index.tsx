
import './style.css';

import { useState } from "preact/hooks";
import { render } from "preact";
import init, { Miner, MiningResult } from "wasm-miner";

const App = () => {
  const [status, setStatus] = useState<string>("Idle");
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
    const start = performance.now();
    const result = miner.mine();
    const duration = performance.now() - start;
    setStatus("Mining Complete!");
	setDuration(duration);
    setResult(result);
  };

  return (
    <div>
      <h1>WASM Bitcoin Miner</h1>
      <input type="text" value={data} onChange={(e) => setData(e.currentTarget.value)} />
      <input type="number" value={difficulty} onChange={(e) => setDifficulty(Number(e.currentTarget.value))} />
      <button onClick={startMining}>Mine!</button>
      <p>Status: {status}</p>
      {result && <p>Result: {result.hash} in {duration.toFixed(1)} ms</p>}
    </div>
  );
};

render(<App />, document.getElementById('app'));

