export type MiningInput = {
  difficulty: number;
  data: string;
};

export type MiningResult = {
  nonce: string;
  hash: string;
  iterations: string;
  durationMs: number;
};
