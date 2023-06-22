import Debug from "debug";
import percentile from "percentile";

const debug = Debug("ambr:copy-chunk-store");

const MAX_CONCURRENCY_INCREASE_RATIO = 2; // Don't more than double concurrency at once
const MEASURE_PERCENTILE = 75; // Use the 75th percentile speed

export const copyChunkStore = (source, dest, numChunks, opts = {}) => {
  const maxConcurrency = opts.maxConcurrency ?? 10;
  const targetChunkDuration = opts.targetChunkDuration ?? 10000;
  let concurrency = opts.initialConcurrency ?? 1;

  if (source.chunkLength !== dest.chunkLength) {
    throw new Error("chunkLength of source and dest must match");
  }

  let concurrencyWindow = [];
  let nextIndex = 0;
  let activeCopies = 0;
  let failed = false;

  let onFinished;
  let onFailed;
  const donePromise = new Promise((resolve, reject) => {
    onFinished = resolve;
    onFailed = reject;
  });

  const startCopies = () => {
    /**
     * Every time `concurrency` requests have finished, measure the 75th percentile
     * duration. Compare that to `targetChunkDuration`, and scale the concurrency
     * by that ratio. This automatically adjusts the concurrency so each chunk takes
     * around the target duration.
     *
     * For example, if `targetChunkDuration` is 10 seconds but it took 2, multiply by 5
     *  (except that it will be clamped to no more than MAX_CONCURRENCY_INCREASE_RATIO).
     * If `targetChunkDuration` is 10 seconds but it took 20, multiply by 0.5.
     * In all cases, keep the concurrency between 1 and `maxConcurrency`
     */
    if (concurrencyWindow.length >= concurrency) {
      // Get the MEASURE_PERCENTILE value from the window
      const measuredDuration = percentile(
        MEASURE_PERCENTILE,
        concurrencyWindow
      );
      debug(
        `measured duration: ${measuredDuration} with concurrency: ${concurrency}`
      );

      const increaseRatio = Math.min(
        targetChunkDuration / measuredDuration,
        MAX_CONCURRENCY_INCREASE_RATIO
      );

      debug(`concurrency increase ratio: ${increaseRatio}`);

      // Clamp between 1 and maxConcurrency
      concurrency = Math.max(
        Math.min(Math.round(concurrency * increaseRatio), maxConcurrency),
        1
      );
      debug(`new concurrency: ${concurrency}`);

      concurrencyWindow = [];
    }

    while (!failed && activeCopies < concurrency && nextIndex < numChunks) {
      const index = nextIndex;
      const startedAt = Date.now();
      nextIndex += 1;
      activeCopies += 1;
      source.get(index, (err, buf) => {
        if (err) {
          failed = true;
          onFailed(err);
          return;
        }

        dest.put(index, buf, (err) => {
          if (err) {
            failed = true;
            onFailed(err);
            return;
          }

          opts.onProgress?.(nextIndex / numChunks);

          concurrencyWindow.push(Date.now() - startedAt);

          activeCopies -= 1;
          if (activeCopies === 0 && nextIndex === numChunks) {
            onFinished();
          } else {
            startCopies();
          }
        });
      });
    }
  };

  startCopies();

  return donePromise;
};
