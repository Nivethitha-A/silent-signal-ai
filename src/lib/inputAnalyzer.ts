// Input pattern detection + best/worst case generators

export type InputPattern = "sorted" | "reverse" | "nearly-sorted" | "random" | "few-unique" | "constant";

export interface PatternAnalysis {
  pattern: InputPattern;
  confidence: number;
  size: number;
  uniqueCount: number;
  inversions: number;
  sortedness: number; // 0..1
  description: string;
  recommendation: { algorithm: string; reason: string };
}

export function analyzeInput(arr: number[]): PatternAnalysis {
  const n = arr.length;
  if (n === 0) {
    return {
      pattern: "random", confidence: 0, size: 0, uniqueCount: 0,
      inversions: 0, sortedness: 1,
      description: "Empty array",
      recommendation: { algorithm: "any", reason: "No data to sort" },
    };
  }

  const unique = new Set(arr).size;
  const sorted = [...arr].sort((a, b) => a - b);
  const reverseSorted = [...sorted].reverse();

  // Count inversions (O(n²) — fine for analyzer use ≤ 1000)
  let inversions = 0;
  const cap = Math.min(n, 500);
  for (let i = 0; i < cap; i++) {
    for (let j = i + 1; j < cap; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  const maxInv = (cap * (cap - 1)) / 2;
  const sortedness = maxInv === 0 ? 1 : 1 - inversions / maxInv;

  let pattern: InputPattern;
  let confidence = 0.7;
  let description = "";

  if (unique === 1) {
    pattern = "constant";
    confidence = 1;
    description = "All elements identical.";
  } else if (unique <= Math.max(3, Math.floor(n * 0.1))) {
    pattern = "few-unique";
    confidence = 0.9;
    description = `Only ${unique} distinct values across ${n} elements.`;
  } else if (arr.every((v, i) => i === 0 || arr[i - 1] <= v)) {
    pattern = "sorted";
    confidence = 1;
    description = "Already sorted ascending.";
  } else if (arr.every((v, i) => i === 0 || arr[i - 1] >= v)) {
    pattern = "reverse";
    confidence = 1;
    description = "Sorted descending — worst case for many algorithms.";
  } else if (sortedness > 0.85) {
    pattern = "nearly-sorted";
    confidence = sortedness;
    description = `~${Math.round(sortedness * 100)}% sorted — small number of out-of-place elements.`;
  } else {
    pattern = "random";
    confidence = 1 - sortedness;
    description = "Randomly distributed values.";
  }

  return {
    pattern,
    confidence,
    size: n,
    uniqueCount: unique,
    inversions,
    sortedness,
    description,
    recommendation: recommendAlgorithm(pattern, n),
  };
}

export function recommendAlgorithm(
  pattern: InputPattern,
  size: number,
): { algorithm: string; reason: string } {
  if (pattern === "sorted" || pattern === "nearly-sorted") {
    return {
      algorithm: "Insertion Sort",
      reason: "Adaptive — runs in O(n) on (nearly) sorted data. Bubble Sort with early-exit also works well.",
    };
  }
  if (pattern === "reverse") {
    return {
      algorithm: "Merge Sort",
      reason: "O(n log n) regardless of input. Quick Sort risks O(n²) on reverse-sorted with naive pivot.",
    };
  }
  if (pattern === "few-unique" || pattern === "constant") {
    return {
      algorithm: "Quick Sort (3-way) / Counting",
      reason: "Few unique keys — partitioning is very effective.",
    };
  }
  if (size <= 16) {
    return {
      algorithm: "Insertion Sort",
      reason: "Tiny arrays beat asymptotically-better algorithms due to low overhead.",
    };
  }
  if (size <= 5000) {
    return {
      algorithm: "Quick Sort",
      reason: "Best average performance with low constant factors.",
    };
  }
  return {
    algorithm: "Merge Sort",
    reason: "Guaranteed O(n log n), stable. Safer at very large sizes.",
  };
}

// ===== Generators =====

export function genRandom(n: number, max = 99): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * max));
}

export function genSorted(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

export function genReverse(n: number): number[] {
  return Array.from({ length: n }, (_, i) => n - i);
}

export function genNearlySorted(n: number, swaps = Math.max(1, Math.floor(n * 0.05))): number[] {
  const a = genSorted(n);
  for (let i = 0; i < swaps; i++) {
    const x = Math.floor(Math.random() * n);
    const y = Math.floor(Math.random() * n);
    [a[x], a[y]] = [a[y], a[x]];
  }
  return a;
}

export function genFewUnique(n: number, distinct = 4): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * distinct) * 10);
}

// ===== Best / Worst case for each algorithm =====

export function bestCaseFor(algo: string, n: number): { array: number[]; explanation: string } {
  switch (algo) {
    case "bubble":
    case "insertion":
      return { array: genSorted(n), explanation: "Already sorted — single pass with no swaps. O(n)." };
    case "selection":
      return { array: genRandom(n), explanation: "Selection Sort always does O(n²) comparisons regardless of input." };
    case "merge":
      return { array: genSorted(n), explanation: "Merge Sort is O(n log n) on all inputs; sorted minimizes merge writes." };
    case "quick":
      return { array: balanced(n), explanation: "Balanced partitions yield O(n log n) recursion depth." };
    case "binary-search":
      return { array: genSorted(n), explanation: "Target at the midpoint — found in 1 comparison." };
    case "linear-search":
      return { array: genRandom(n), explanation: "Target at index 0 — found immediately." };
    default:
      return { array: genRandom(n), explanation: "Standard random input." };
  }
}

export function worstCaseFor(algo: string, n: number): { array: number[]; explanation: string } {
  switch (algo) {
    case "bubble":
    case "insertion":
    case "selection":
      return { array: genReverse(n), explanation: "Reverse-sorted — maximum comparisons and swaps. O(n²)." };
    case "merge":
      return { array: genRandom(n), explanation: "Merge Sort is O(n log n) worst case — input shape barely matters." };
    case "quick":
      return { array: genSorted(n), explanation: "With last-element pivot, sorted input degrades to O(n²)." };
    case "binary-search":
      return { array: genSorted(n), explanation: "Target absent — full log₂(n) comparisons." };
    case "linear-search":
      return { array: genRandom(n), explanation: "Target at end (or absent) — must scan everything. O(n)." };
    default:
      return { array: genReverse(n), explanation: "Reverse-sorted." };
  }
}

function balanced(n: number): number[] {
  // Build an array where last-element pivot consistently lands in middle.
  const sorted = genSorted(n);
  const result: number[] = [];
  function build(arr: number[]) {
    if (arr.length === 0) return;
    if (arr.length === 1) { result.push(arr[0]); return; }
    const mid = Math.floor((arr.length - 1) / 2);
    const pivot = arr[mid];
    const left = arr.slice(0, mid);
    const right = arr.slice(mid + 1);
    build(left);
    build(right);
    result.push(pivot);
  }
  build(sorted);
  return result;
}
