import * as tf from "@tensorflow/tfjs";
import { ALGORITHMS, AlgorithmId, benchmark } from "./algorithms";
import { genFewUnique, genNearlySorted, genRandom, genReverse, genSorted } from "./inputAnalyzer";

export type PatternId = "random" | "sorted" | "reverse" | "nearly" | "few-unique";
export const ML_ALGOS: AlgorithmId[] = ["bubble", "selection", "insertion", "merge", "quick"];
export const ML_PATTERNS: PatternId[] = ["random", "sorted", "reverse", "nearly", "few-unique"];

export interface TrainSample {
  size: number;
  algoIdx: number;
  patternIdx: number;
  comparisons: number;
  timeMs: number;
}

function makeArray(p: PatternId, n: number): number[] {
  switch (p) {
    case "sorted": return genSorted(n);
    case "reverse": return genReverse(n);
    case "nearly": return genNearlySorted(n);
    case "few-unique": return genFewUnique(n, 4);
    default: return genRandom(n);
  }
}

/** Generate benchmark samples across sizes/algos/patterns. */
export async function collectSamples(
  sizes: number[],
  onProgress?: (done: number, total: number) => void,
): Promise<TrainSample[]> {
  const samples: TrainSample[] = [];
  const total = sizes.length * ML_ALGOS.length * ML_PATTERNS.length;
  let done = 0;
  for (const n of sizes) {
    for (let pi = 0; pi < ML_PATTERNS.length; pi++) {
      const arr = makeArray(ML_PATTERNS[pi], n);
      for (let ai = 0; ai < ML_ALGOS.length; ai++) {
        const stats = benchmark(ML_ALGOS[ai], arr);
        samples.push({
          size: n, algoIdx: ai, patternIdx: pi,
          comparisons: stats.comparisons,
          timeMs: stats.durationMs,
        });
        done++;
        if (done % 5 === 0) {
          onProgress?.(done, total);
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    }
  }
  onProgress?.(total, total);
  return samples;
}

export interface TrainedModel {
  model: tf.LayersModel;
  // normalization stats
  sizeMean: number;
  sizeStd: number;
  yMean: number;
  yStd: number;
  // for un-log
  useLogY: boolean;
  finalLoss: number;
  history: number[];
}

/**
 * Train a tiny MLP to predict log(time) from (normalized size, algo one-hot, pattern one-hot).
 * Log-target gives smoother regression for non-linear growth (n^2, n log n).
 */
export async function trainModel(
  samples: TrainSample[],
  onEpoch?: (epoch: number, loss: number) => void,
): Promise<TrainedModel> {
  const sizes = samples.map((s) => s.size);
  const sizeMean = mean(sizes);
  const sizeStd = std(sizes, sizeMean) || 1;

  // log-time target
  const ys = samples.map((s) => Math.log(Math.max(s.timeMs, 0.01)));
  const yMean = mean(ys);
  const yStd = std(ys, yMean) || 1;

  const xs: number[][] = samples.map((s) => {
    const algoVec = oneHot(s.algoIdx, ML_ALGOS.length);
    const patVec = oneHot(s.patternIdx, ML_PATTERNS.length);
    const normSize = (s.size - sizeMean) / sizeStd;
    const logSize = (Math.log(s.size) - Math.log(sizeMean || 1));
    return [normSize, logSize, ...algoVec, ...patVec];
  });
  const ysNorm = ys.map((y) => (y - yMean) / yStd);

  const xTensor = tf.tensor2d(xs);
  const yTensor = tf.tensor2d(ysNorm.map((y) => [y]));

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [xs[0].length], units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: tf.train.adam(0.01), loss: "meanSquaredError" });

  const history: number[] = [];
  await model.fit(xTensor, yTensor, {
    epochs: 80,
    batchSize: 16,
    shuffle: true,
    verbose: 0,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        const loss = (logs?.loss as number) ?? 0;
        history.push(loss);
        onEpoch?.(epoch, loss);
        await tf.nextFrame();
      },
    },
  });

  xTensor.dispose();
  yTensor.dispose();

  return {
    model, sizeMean, sizeStd, yMean, yStd, useLogY: true,
    finalLoss: history[history.length - 1] ?? 0, history,
  };
}

export function predictRuntime(
  trained: TrainedModel,
  size: number,
  algoId: AlgorithmId,
  patternId: PatternId,
): number {
  const algoIdx = ML_ALGOS.indexOf(algoId);
  const patIdx = ML_PATTERNS.indexOf(patternId);
  if (algoIdx < 0 || patIdx < 0) return 0;

  const normSize = (size - trained.sizeMean) / trained.sizeStd;
  const logSize = Math.log(size) - Math.log(trained.sizeMean || 1);
  const x = [normSize, logSize, ...oneHot(algoIdx, ML_ALGOS.length), ...oneHot(patIdx, ML_PATTERNS.length)];

  const t = tf.tidy(() => {
    const out = trained.model.predict(tf.tensor2d([x])) as tf.Tensor;
    return out.dataSync()[0];
  });
  const yLog = t * trained.yStd + trained.yMean;
  return Math.max(0, Math.exp(yLog));
}

export function recommendByPrediction(
  trained: TrainedModel,
  size: number,
  patternId: PatternId,
): { algoId: AlgorithmId; predictedMs: number }[] {
  return ML_ALGOS
    .map((algoId) => ({ algoId, predictedMs: predictRuntime(trained, size, algoId, patternId) }))
    .sort((a, b) => a.predictedMs - b.predictedMs);
}

function mean(arr: number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function std(arr: number[], m: number) {
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  return Math.sqrt(v);
}
function oneHot(i: number, n: number): number[] {
  const v = new Array(n).fill(0);
  v[i] = 1;
  return v;
}

export const algoLabel = (id: AlgorithmId) => ALGORITHMS[id].name;
