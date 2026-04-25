// ============================================
// Algorithm Engine — Step generators with full
// instrumentation (comparisons, swaps, reads, writes)
// Each algorithm is a generator that yields a Step.
// ============================================

export type StepType =
  | "compare"
  | "swap"
  | "overwrite"
  | "set-pivot"
  | "mark-sorted"
  | "highlight"
  | "visit"
  | "path"
  | "found"
  | "not-found"
  | "done"
  | "info";

export interface Step {
  type: StepType;
  array?: number[];
  indices?: number[];
  message: string;
  line?: number; // pseudocode line to highlight
  meta?: Record<string, unknown>;
}

export interface RunStats {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  steps: number;
  durationMs: number;
}

export type AlgorithmId =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "binary-search"
  | "linear-search"
  | "bfs"
  | "dfs";

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  category: "sort" | "search" | "graph";
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  stable?: boolean;
  description: string;
  pseudocode: string[];
}

export const ALGORITHMS: Record<AlgorithmId, AlgorithmInfo> = {
  bubble: {
    id: "bubble",
    name: "Bubble Sort",
    category: "sort",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: true,
    description: "Repeatedly swaps adjacent elements that are out of order.",
    pseudocode: [
      "for i = 0 to n-1",
      "  swapped = false",
      "  for j = 0 to n-i-2",
      "    if a[j] > a[j+1]",
      "      swap a[j], a[j+1]",
      "      swapped = true",
      "  if not swapped break",
    ],
  },
  selection: {
    id: "selection",
    name: "Selection Sort",
    category: "sort",
    timeBest: "O(n²)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: false,
    description: "Repeatedly selects the minimum from the unsorted region.",
    pseudocode: [
      "for i = 0 to n-1",
      "  min = i",
      "  for j = i+1 to n-1",
      "    if a[j] < a[min]",
      "      min = j",
      "  swap a[i], a[min]",
    ],
  },
  insertion: {
    id: "insertion",
    name: "Insertion Sort",
    category: "sort",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: true,
    description: "Builds the sorted array one element at a time.",
    pseudocode: [
      "for i = 1 to n-1",
      "  key = a[i]; j = i-1",
      "  while j >= 0 and a[j] > key",
      "    a[j+1] = a[j]",
      "    j = j-1",
      "  a[j+1] = key",
    ],
  },
  merge: {
    id: "merge",
    name: "Merge Sort",
    category: "sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    stable: true,
    description: "Divide the array, sort halves, then merge.",
    pseudocode: [
      "mergeSort(a, l, r):",
      "  if l >= r return",
      "  m = (l+r)/2",
      "  mergeSort(a, l, m)",
      "  mergeSort(a, m+1, r)",
      "  merge(a, l, m, r)",
    ],
  },
  quick: {
    id: "quick",
    name: "Quick Sort",
    category: "sort",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n²)",
    space: "O(log n)",
    stable: false,
    description: "Partition around a pivot, recurse on both sides.",
    pseudocode: [
      "quickSort(a, l, r):",
      "  if l >= r return",
      "  p = partition(a, l, r)",
      "  quickSort(a, l, p-1)",
      "  quickSort(a, p+1, r)",
    ],
  },
  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    category: "search",
    timeBest: "O(1)",
    timeAvg: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
    description: "Search a sorted array by halving the range.",
    pseudocode: [
      "lo = 0; hi = n-1",
      "while lo <= hi:",
      "  mid = (lo+hi)/2",
      "  if a[mid] == target return mid",
      "  if a[mid] < target lo = mid+1",
      "  else hi = mid-1",
      "return -1",
    ],
  },
  "linear-search": {
    id: "linear-search",
    name: "Linear Search",
    category: "search",
    timeBest: "O(1)",
    timeAvg: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
    description: "Scan each element until target is found.",
    pseudocode: [
      "for i = 0 to n-1:",
      "  if a[i] == target return i",
      "return -1",
    ],
  },
  bfs: {
    id: "bfs",
    name: "Breadth-First Search",
    category: "graph",
    timeBest: "O(V+E)",
    timeAvg: "O(V+E)",
    timeWorst: "O(V+E)",
    space: "O(V)",
    description: "Explore neighbors level by level using a queue.",
    pseudocode: [
      "queue = [start]; visited = {start}",
      "while queue not empty:",
      "  node = queue.dequeue()",
      "  for neighbor of node:",
      "    if not visited:",
      "      visited.add(neighbor)",
      "      queue.enqueue(neighbor)",
    ],
  },
  dfs: {
    id: "dfs",
    name: "Depth-First Search",
    category: "graph",
    timeBest: "O(V+E)",
    timeAvg: "O(V+E)",
    timeWorst: "O(V+E)",
    space: "O(V)",
    description: "Explore as deep as possible using a stack/recursion.",
    pseudocode: [
      "dfs(node):",
      "  visited.add(node)",
      "  for neighbor of node:",
      "    if not visited:",
      "      dfs(neighbor)",
    ],
  },
};

// ===== Sorting generators =====

export function* bubbleSort(input: number[]): Generator<Step> {
  const a = [...input];
  const n = a.length;
  yield { type: "info", array: [...a], message: "Start bubble sort", line: 0 };
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: "compare", array: [...a], indices: [j, j + 1], message: `Compare a[${j}]=${a[j]} with a[${j + 1}]=${a[j + 1]}`, line: 3 };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        yield { type: "swap", array: [...a], indices: [j, j + 1], message: `Swap`, line: 4 };
      }
    }
    yield { type: "mark-sorted", array: [...a], indices: [n - i - 1], message: `Position ${n - i - 1} sorted`, line: 6 };
    if (!swapped) break;
  }
  yield { type: "done", array: [...a], indices: Array.from({ length: n }, (_, i) => i), message: "Sorted!" };
}

export function* selectionSort(input: number[]): Generator<Step> {
  const a = [...input];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    yield { type: "highlight", array: [...a], indices: [i], message: `Select position ${i}`, line: 1 };
    for (let j = i + 1; j < n; j++) {
      yield { type: "compare", array: [...a], indices: [min, j], message: `Compare a[${j}] with current min a[${min}]`, line: 3 };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { type: "swap", array: [...a], indices: [i, min], message: `Swap a[${i}] with a[${min}]`, line: 5 };
    }
    yield { type: "mark-sorted", array: [...a], indices: [i], message: `Position ${i} fixed`, line: 5 };
  }
  yield { type: "done", array: [...a], indices: Array.from({ length: n }, (_, i) => i), message: "Sorted!" };
}

export function* insertionSort(input: number[]): Generator<Step> {
  const a = [...input];
  const n = a.length;
  yield { type: "mark-sorted", array: [...a], indices: [0], message: "First element trivially sorted", line: 0 };
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    yield { type: "highlight", array: [...a], indices: [i], message: `Take key = a[${i}] = ${key}`, line: 1 };
    while (j >= 0 && a[j] > key) {
      yield { type: "compare", array: [...a], indices: [j, i], message: `a[${j}]=${a[j]} > key=${key}, shift`, line: 2 };
      a[j + 1] = a[j];
      yield { type: "overwrite", array: [...a], indices: [j + 1], message: `Shift a[${j}] right`, line: 3 };
      j--;
    }
    a[j + 1] = key;
    yield { type: "overwrite", array: [...a], indices: [j + 1], message: `Insert key at position ${j + 1}`, line: 5 };
  }
  yield { type: "done", array: [...a], indices: Array.from({ length: n }, (_, i) => i), message: "Sorted!" };
}

export function* mergeSort(input: number[]): Generator<Step> {
  const a = [...input];
  function* sort(l: number, r: number): Generator<Step> {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    yield { type: "highlight", array: [...a], indices: rangeIdx(l, r), message: `Divide [${l}..${r}]`, line: 2 };
    yield* sort(l, m);
    yield* sort(m + 1, r);
    yield* merge(l, m, r);
  }
  function* merge(l: number, m: number, r: number): Generator<Step> {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      yield { type: "compare", array: [...a], indices: [l + i, m + 1 + j], message: `Merge: compare ${left[i]} and ${right[j]}`, line: 5 };
      if (left[i] <= right[j]) { a[k++] = left[i++]; }
      else { a[k++] = right[j++]; }
      yield { type: "overwrite", array: [...a], indices: [k - 1], message: `Place at ${k - 1}`, line: 5 };
    }
    while (i < left.length) { a[k++] = left[i++]; yield { type: "overwrite", array: [...a], indices: [k - 1], message: `Place left`, line: 5 }; }
    while (j < right.length) { a[k++] = right[j++]; yield { type: "overwrite", array: [...a], indices: [k - 1], message: `Place right`, line: 5 }; }
  }
  yield* sort(0, a.length - 1);
  yield { type: "done", array: [...a], indices: rangeIdx(0, a.length - 1), message: "Sorted!" };
}

export function* quickSort(input: number[]): Generator<Step> {
  const a = [...input];
  function* sort(l: number, r: number): Generator<Step> {
    if (l >= r) return;
    const pivot = a[r];
    yield { type: "set-pivot", array: [...a], indices: [r], message: `Pivot = a[${r}] = ${pivot}`, line: 2 };
    let i = l - 1;
    for (let j = l; j < r; j++) {
      yield { type: "compare", array: [...a], indices: [j, r], message: `Compare a[${j}]=${a[j]} with pivot ${pivot}`, line: 2 };
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          yield { type: "swap", array: [...a], indices: [i, j], message: `Swap into low partition`, line: 2 };
        }
      }
    }
    [a[i + 1], a[r]] = [a[r], a[i + 1]];
    yield { type: "swap", array: [...a], indices: [i + 1, r], message: `Place pivot at ${i + 1}`, line: 2 };
    yield* sort(l, i);
    yield* sort(i + 2, r);
  }
  yield* sort(0, a.length - 1);
  yield { type: "done", array: [...a], indices: rangeIdx(0, a.length - 1), message: "Sorted!" };
}

// ===== Search generators =====

export function* binarySearch(input: number[], target: number): Generator<Step> {
  const a = [...input].sort((x, y) => x - y); // binary search needs sorted
  let lo = 0, hi = a.length - 1;
  yield { type: "info", array: [...a], message: `Searching ${target} in sorted array`, line: 0 };
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    yield { type: "highlight", array: [...a], indices: [lo, mid, hi], message: `lo=${lo}, mid=${mid}, hi=${hi}`, line: 2 };
    yield { type: "compare", array: [...a], indices: [mid], message: `Check a[${mid}]=${a[mid]} vs ${target}`, line: 3 };
    if (a[mid] === target) {
      yield { type: "found", array: [...a], indices: [mid], message: `Found at index ${mid}!`, line: 3 };
      return;
    }
    if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  yield { type: "not-found", array: [...a], message: `${target} not found`, line: 6 };
}

export function* linearSearch(input: number[], target: number): Generator<Step> {
  const a = [...input];
  for (let i = 0; i < a.length; i++) {
    yield { type: "compare", array: [...a], indices: [i], message: `Check a[${i}]=${a[i]} vs ${target}`, line: 1 };
    if (a[i] === target) {
      yield { type: "found", array: [...a], indices: [i], message: `Found at index ${i}!`, line: 1 };
      return;
    }
  }
  yield { type: "not-found", array: [...a], message: `${target} not found`, line: 2 };
}

// ===== Graph (BFS / DFS) =====
export interface GraphData {
  nodes: { id: number; x: number; y: number }[];
  adj: number[][]; // adjacency list
}

export interface GraphStep {
  type: "visit" | "queue" | "path" | "info" | "done";
  visited: number[];
  current?: number;
  frontier: number[];
  message: string;
}

export function* bfs(g: GraphData, start: number): Generator<GraphStep> {
  const visited = new Set<number>([start]);
  const queue = [start];
  yield { type: "info", visited: [...visited], frontier: [...queue], message: `BFS from node ${start}` };
  while (queue.length) {
    const node = queue.shift()!;
    yield { type: "visit", visited: [...visited], current: node, frontier: [...queue], message: `Visit ${node}` };
    for (const nb of g.adj[node] || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
        yield { type: "queue", visited: [...visited], current: node, frontier: [...queue], message: `Enqueue ${nb}` };
      }
    }
  }
  yield { type: "done", visited: [...visited], frontier: [], message: "Traversal complete" };
}

export function* dfs(g: GraphData, start: number): Generator<GraphStep> {
  const visited = new Set<number>();
  const stack = [start];
  yield { type: "info", visited: [], frontier: [...stack], message: `DFS from node ${start}` };
  while (stack.length) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    yield { type: "visit", visited: [...visited], current: node, frontier: [...stack], message: `Visit ${node}` };
    for (const nb of [...(g.adj[node] || [])].reverse()) {
      if (!visited.has(nb)) {
        stack.push(nb);
        yield { type: "queue", visited: [...visited], current: node, frontier: [...stack], message: `Push ${nb}` };
      }
    }
  }
  yield { type: "done", visited: [...visited], frontier: [], message: "Traversal complete" };
}

// ===== Helpers =====

function rangeIdx(l: number, r: number) {
  return Array.from({ length: r - l + 1 }, (_, i) => l + i);
}

export function getSortGenerator(id: AlgorithmId, arr: number[]): Generator<Step> {
  switch (id) {
    case "bubble": return bubbleSort(arr);
    case "selection": return selectionSort(arr);
    case "insertion": return insertionSort(arr);
    case "merge": return mergeSort(arr);
    case "quick": return quickSort(arr);
    default: return bubbleSort(arr);
  }
}

// Run an algorithm to completion and gather stats (no animation).
// Used by Performance Engine, Comparison, ML training.
export function benchmark(id: AlgorithmId, arr: number[], target?: number): RunStats {
  const start = performance.now();
  let comparisons = 0, swaps = 0, reads = 0, writes = 0, steps = 0;

  let gen: Generator<Step>;
  if (id === "binary-search") gen = binarySearch(arr, target ?? arr[0]);
  else if (id === "linear-search") gen = linearSearch(arr, target ?? arr[0]);
  else gen = getSortGenerator(id, arr);

  for (const step of gen) {
    steps++;
    if (step.type === "compare") { comparisons++; reads += 2; }
    if (step.type === "swap") { swaps++; reads += 2; writes += 2; }
    if (step.type === "overwrite") { writes++; }
  }
  return { comparisons, swaps, reads, writes, steps, durationMs: performance.now() - start };
}
