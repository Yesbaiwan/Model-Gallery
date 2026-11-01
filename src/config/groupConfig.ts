import type { CustomGroupRule, GroupRule } from "../types.ts";
import { BUILTIN_GROUP_NAMES, BUILTIN_GROUP_RULES, DEFAULT_ICON } from "./builtinGroups.ts";

export { BUILTIN_GROUP_NAMES };

function keyOf(name: string): string {
  return name.toLowerCase();
}

/**
 * 合并内置组与自定义组并按 order 升序排列。
 *
 * 判定规则：
 * - 同名自定义规则覆盖内置组（或此前同名的自定义规则），以最后一条为准。
 * - order 必填且全局唯一，且必须小于 default 的 order，保证 default 始终在最后。
 *   覆盖内置组时写该内置组原本的 order 不算冲突（被覆盖的内置组已从集合中移除）。
 * - icon：填了就用填的；覆盖内置组未填时沿用内置图标；全新分组未填时用 DEFAULT_ICON。
 */
export function buildGroupRules(customRules: readonly CustomGroupRule[] = []): GroupRule[] {
  const lastIndexByKey = new Map<string, number>();
  customRules.forEach((rule, index) => lastIndexByKey.set(keyOf(rule.name), index));

  const entries: Array<{ rule: GroupRule; order: number }> = [];
  for (const builtin of BUILTIN_GROUP_RULES) {
    if (lastIndexByKey.has(keyOf(builtin.name))) continue;
    entries.push({
      rule: { name: builtin.name, icon: builtin.icon, keywords: builtin.keywords },
      order: builtin.order,
    });
  }

  customRules.forEach((custom, index) => {
    const key = keyOf(custom.name);
    if (lastIndexByKey.get(key) !== index) return;
    const builtin = BUILTIN_GROUP_RULES.find((rule) => keyOf(rule.name) === key);
    entries.push({
      rule: {
        name: custom.name,
        icon: custom.icon ?? builtin?.icon ?? DEFAULT_ICON,
        keywords: custom.keywords,
      },
      order: custom.order,
    });
  });

  const defaultOrder = entries.find((entry) => keyOf(entry.rule.name) === "default")?.order ?? Infinity;
  const seenOrders = new Map<number, string>();
  for (const { rule, order } of entries) {
    if (keyOf(rule.name) !== "default" && order >= defaultOrder) {
      throw new Error(`配置错误: 分组 order ${order} 必须小于 default 的 ${defaultOrder}（"${rule.name}"）`);
    }
    const previous = seenOrders.get(order);
    if (previous !== undefined) {
      throw new Error(
        `配置错误: 分组 order ${order} 重复（"${previous}" 与 "${rule.name}"），每个分组必须使用不同的 order`,
      );
    }
    seenOrders.set(order, rule.name);
  }

  return entries.sort((a, b) => a.order - b.order).map((entry) => entry.rule);
}

export function getGroupDisplayName(groupName: string, rules: readonly GroupRule[] = BUILTIN_GROUP_RULES): string {
  return rules.find((rule) => keyOf(rule.name) === keyOf(groupName))?.name ?? groupName;
}

const TOKEN_CHAR = /[a-z0-9]/;

/** 关键词只需在“词首”出现即命中：`ling` 不会命中 `kling`，`wan` 能命中 `wanx2.1`；中文关键词不受限制。 */
function matchesKeyword(model: string, keyword: string): boolean {
  if (!TOKEN_CHAR.test(keyword[0])) return model.includes(keyword);
  let index = model.indexOf(keyword);
  while (index !== -1) {
    const before = model[index - 1];
    if (before === undefined || !TOKEN_CHAR.test(before)) return true;
    index = model.indexOf(keyword, index + 1);
  }
  return false;
}

/** 按 order 从小到大逐条匹配关键词，首个命中生效，未命中归入 default。 */
export function groupModels(models: string[], rules: readonly GroupRule[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const defaultName = rules.find((rule) => keyOf(rule.name) === "default")?.name ?? "default";
  // 关键词与规则名只在进入模型循环前小写一次，避免每个模型重复做同等数量的字符串分配
  const matchers = rules
    .filter((rule) => keyOf(rule.name) !== "default")
    .map((rule) => ({ name: rule.name, keywords: rule.keywords?.map((keyword) => keyword.toLowerCase()) ?? [] }));
  for (const model of models) {
    const modelLower = model.toLowerCase();
    const matchingRule = matchers.find((matcher) =>
      matcher.keywords.some((keyword) => matchesKeyword(modelLower, keyword)),
    );
    const groupName = matchingRule?.name ?? defaultName;
    const group = groups.get(groupName) ?? [];
    group.push(model);
    groups.set(groupName, group);
  }
  return groups;
}

export function orderedGroups(
  groupedModels: Map<string, string[]>,
  rules: readonly GroupRule[],
): Array<{ rule: GroupRule; models: string[] }> {
  return rules.flatMap((rule) => {
    const models = groupedModels.get(rule.name);
    return models?.length ? [{ rule, models }] : [];
  });
}
