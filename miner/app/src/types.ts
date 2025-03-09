export type MiningInput = {
  difficulty: number;
  data: string;
};

export enum MiningState {
  IDLE,
  MINING,
  SUCCESS,
}

export type MiningResult = {
  nonce: string;
  hash: string;
  iterations: string;
  durationMs: number;
};
