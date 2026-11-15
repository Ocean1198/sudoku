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

// "classic-x" → ["classic", "X-Sudoku"]. 알 수 없는 코드가 있으면 에러.
export function parseRulesKey(rulesKey: string): RuleId[] {
  if (rulesKey === "none") return [];
  const byCode = new Map<string, RuleId>(
    (Object.entries(RULE_CODES) as [RuleId, string][]).map(([id, code]) => [code, id])
  );
  return rulesKey.split("-").map(code => {
    const id = byCode.get(code);
    if (id === undefined) {
      throw new Error(`알 수 없는 규칙 코드: "${code}" (사용 가능: ${[...byCode.keys()].join(", ")})`);
    }
    return id;
  });
}