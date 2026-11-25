# Architecture
- Keep reusable wellness scoring, Guardian thresholds, and seven-day health-memory calculations in `src/lib/silentSignal.ts`, with Vitest coverage in `src/__tests__/`, so UI and tests share one source of truth.
- Configure Vitest through `vite.config.ts` with jsdom and the shared setup file, keeping the project on one Vite configuration path.