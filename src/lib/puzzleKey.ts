import type { RuleId } from "./RuleManager";

const RULE_CODES = {
  "classic": "classic",
  "X-Sudoku": "x",
  "Anti-Knight": "antiknight",
} as const satisfies Record<RuleId, string>;

export function makeRulesKey(rules: RuleId[]): string {
  const codes = (Object.entries(RULE_CODES) as [RuleId, string][])
    .filter(([id]) => rules.includes(id))
    .map(([, code]) => code);
  return codes.length > 0 ? codes.join("-") : "none";
}

export function makePuzzleKey(br: number, bc: number, level: number, rules: RuleId[]): string {
  return `${br}x${bc}/${makeRulesKey(rules)}/${level}`;
}

export function makePuzzlePath(key: string, id: number): string {
  return `${key}/${String(id).padStart(4, "0")}.json`;
}
