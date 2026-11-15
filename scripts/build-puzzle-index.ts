import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "../public/puzzles");
const index: Record<string, number[]> = {};

for (const file of readdirSync(dir)) {
  const m = /^(.+)_(\d{4})\.json$/.exec(file);   // index.json, README.md는 걸러짐
  if (!m) continue;
  (index[m[1]] ??= []).push(Number(m[2]));
}
for (const ids of Object.values(index)) ids.sort((a, b) => a - b);

writeFileSync(join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n");
console.log(index);