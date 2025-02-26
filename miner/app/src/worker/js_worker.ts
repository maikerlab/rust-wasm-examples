import { MiningInput, MiningResult } from "../types";

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function mine(input: MiningInput) {
  let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  let iterations = 1;
  const start = performance.now();
  while (true) {
    const hash = await sha256(input.data + nonce);

    // Check if hash meets difficulty criteria (starts with N leading zeros)
    if (hash.startsWith("0".repeat(input.difficulty))) {
      const end = performance.now();
      const result = {
        iterations: String(iterations),
        hash,
        nonce: String(nonce),
        durationMs: end - start,
      } as MiningResult;
      return result;
    }
    nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    iterations++;
  }
}

self.onmessage = async (e: MessageEvent<string>) => {
  const input = JSON.parse(e.data) as MiningInput;
  const result = await mine(input);
  self.postMessage(JSON.stringify(result));
};

export {};
