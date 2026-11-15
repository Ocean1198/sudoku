import type { RuleId } from "./RuleManager";

const RULE_ORDER: RuleId[] = ["classic", "X-Sudoku", "Anti-Knight"];

export function makeRulesKey(rules: RuleId[]): string {
  return RULE_ORDER.map(r => (rules.includes(r) ? "1" : "0")).join("");
}

// 예: "33_0_111"
export function makePuzzleKey(br: number, bc: number, level: number, rules: RuleId[]): string {
  return `${br}${bc}_${level}_${makeRulesKey(rules)}`;
}

// 예: "33_0_111_0002.json"
export function makePuzzleFileName(key: string, id: number): string {
  return `${key}_${String(id).padStart(4, "0")}.json`;
}