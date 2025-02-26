import init, { Miner } from "wasm-miner";
import { MiningInput, MiningResult } from "../types";

self.onmessage = (e: MessageEvent<string>) => {
  const input = JSON.parse(e.data) as MiningInput;
  const miner = new Miner(input.data, input.difficulty);
  const start = performance.now();
  const wasmResult = miner.mine();
  const end = performance.now();
  const result = { ...wasmResult, durationMs: end - start } as MiningResult;
  self.postMessage(JSON.stringify(result));
};

await init();

export {};
