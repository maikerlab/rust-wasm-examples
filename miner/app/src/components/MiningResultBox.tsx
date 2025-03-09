import { useMemo } from "react";
import { MiningResult, MiningState } from "../types";
import { motion } from "framer-motion";

export interface MiningResultBoxProps {
  title: string;
  state: MiningState;
  result?: MiningResult;
}

export default function MiningResultBox({
  title,
  state,
  result,
}: MiningResultBoxProps) {
  const iterationsPerSecond = useMemo(() => {
    return (
      result &&
      (Number(result.iterations) / (result.durationMs / 1000)).toLocaleString(
        "en-US",
        { maximumFractionDigits: 0 },
      )
    );
  }, [result]);

  return (
    <div class="p-3 bg-gray-700 rounded-lg w-full min-h-48 text-center flex flex-col">
      <h2 class="text-2xl flex-none">{title}</h2>
      {state == MiningState.SUCCESS && result ? (
        <div class="flex flex-grow flex-col justify-center text-left">
          <p class="text-gray-300 mt-2">{`Found with nonce: ${result.nonce}`}</p>
          <p class="text-gray-300">
            {`${result.iterations} iterations in ${result.durationMs.toFixed(
              1,
            )} ms`}
          </p>
          <p class="text-gray-300">{`~ ${iterationsPerSecond} iterations per second`}</p>
          <div class="text-gray-400 font-mono break-all bg-gray-800 p-2 rounded-lg mt-2 w-full">
            {result.hash}
          </div>
        </div>
      ) : state == MiningState.MINING ? (
        <motion.div
          class="flex flex-grow flex-col justify-center text-5xl"
          initial={{ rotate: 0 }}
          animate={{ rotate: [-45, 0] }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          ⛏️
        </motion.div>
      ) : (
        <div class="flex flex-grow flex-col justify-center text-5xl">❔</div>
      )}
    </div>
  );
}
