import { readdirSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

const dir = join(import.meta.dirname, "../public/puzzles");
const index: Record<string, number[]> = {};

for (const entry of readdirSync(dir, { recursive: true }) as string[]) {
  const rel = entry.split(sep).join("/");            // Windows 경로 구분자 대응
  const m = /^(\d+x\d+\/[a-z]+(?:-[a-z]+)*\/\d+)\/(\d{4,})\.json$/.exec(rel);
  if (!m) continue;                                   // index.json, README.md 등은 제외
  (index[m[1]] ??= []).push(Number(m[2]));
}

const sorted = Object.fromEntries(
  Object.keys(index).sort().map(k => [k, index[k].sort((a, b) => a - b)])
);
writeFileSync(join(dir, "index.json"), JSON.stringify(sorted, null, 2) + "\n");
console.log(sorted);