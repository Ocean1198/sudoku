const verbose: boolean = import.meta.env.DEV || (() => {
  try { return localStorage.getItem("debug") === "puzzle"; } catch { return false; }
})();

let seq = 0;

export function createPuzzleLogger() {
  const tag = `[puzzle #${++seq}]`;
  return {
    info: (...args: unknown[]) => { if (verbose) console.info(tag, ...args); },
    warn: (...args: unknown[]) => { console.warn(tag, ...args); },
  };
}

export type PuzzleLogger = ReturnType<typeof createPuzzleLogger>;