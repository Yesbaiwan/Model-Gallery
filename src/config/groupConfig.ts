import type { CustomGroupRule, GroupRule } from "../types.ts";
import { BUILTIN_GROUP_NAMES, BUILTIN_GROUP_RULES, DEFAULT_ICON } from "./builtinGroups.ts";

export { BUILTIN_GROUP_NAMES };

type RulePosition = "first" | "last" | "before" | "base";
interface RuleNode {
  key: string;
  rule: GroupRule;
  position: RulePosition;
  target?: string;
  configOrder: number;
  baseOrder: number;
}

function keyOf(name: string): string {
  return name.toLowerCase();
}

function addEdge(edges: Map<string, Set<string>>, from: string, to: string): void {
  if (from === to) throw new Error(`分组位置形成循环: ${from}`);
  edges.get(from)!.add(to);
}

function createEffectiveNodes(customRules: CustomGroupRule[]): {
  nodes: Map<string, RuleNode>;
  customNodes: RuleNode[];
} {
  const customByKey = new Map<string, { rule: CustomGroupRule; order: number }>();
  customRules.forEach((rule, order) => {
    const key = keyOf(rule.name);
    customByKey.delete(key);
    customByKey.set(key, { rule, order });
  });

  const nodes = new Map<string, RuleNode>();
  BUILTIN_GROUP_RULES.forEach((rule, baseOrder) => {
    const key = keyOf(rule.name);
    if (customByKey.has(key)) return;
    nodes.set(key, { key, rule, position: "base", configOrder: -1, baseOrder });
  });

  const customNodes: RuleNode[] = [];
  for (const [key, { rule: custom, order }] of customByKey) {
    const node: RuleNode = {
      key,
      rule: { name: custom.name, icon: custom.icon || DEFAULT_ICON, keywords: custom.keywords },
      position: custom.position?.type ?? "first",
      target: custom.position?.target,
      configOrder: order,
      baseOrder: Number.MAX_SAFE_INTEGER,
    };
    nodes.set(key, node);
    customNodes.push(node);
  }
  return { nodes, customNodes };
}

function stableOrder(nodes: Map<string, RuleNode>, customNodes: RuleNode[]): GroupRule[] {
  const edges = new Map<string, Set<string>>([...nodes.keys()].map((key) => [key, new Set<string>()]));
  const indegree = new Map<string, number>([...nodes.keys()].map((key) => [key, 0]));
  const customByPosition = (position: RulePosition) =>
    customNodes.filter((node) => node.position === position).sort((a, b) => a.configOrder - b.configOrder);
  const first = customByPosition("first");
  const before = customByPosition("before");
  const last = customByPosition("last");
  const base = [...nodes.values()].filter((node) => node.position === "base").sort((a, b) => a.baseOrder - b.baseOrder);

  const connect = (from: string, to: string) => {
    if (edges.get(from)!.has(to)) return;
    addEdge(edges, from, to);
    indegree.set(to, indegree.get(to)! + 1);
  };

  for (let i = 1; i < base.length; i++) connect(base[i - 1].key, base[i].key);
  for (let i = 1; i < first.length; i++) connect(first[i - 1].key, first[i].key);
  for (let i = 1; i < last.length; i++) connect(last[i - 1].key, last[i].key);

  for (const firstNode of first)
    for (const other of nodes.values())
      if (other.key !== firstNode.key && other.position !== "first") connect(firstNode.key, other.key);
  for (const lastNode of last)
    for (const other of nodes.values())
      if (other.key !== lastNode.key && other.position !== "last") connect(other.key, lastNode.key);

  const beforeByTarget = new Map<string, RuleNode[]>();
  for (const node of before) {
    const targetKey = keyOf(node.target!);
    if (!nodes.has(targetKey)) throw new Error(`无效的分组插入目标: ${node.target}`);
    const sameTarget = beforeByTarget.get(targetKey) ?? [];
    if (sameTarget.length) connect(sameTarget[sameTarget.length - 1].key, node.key);
    sameTarget.push(node);
    beforeByTarget.set(targetKey, sameTarget);
    connect(node.key, targetKey);
  }

  const rank = (node: RuleNode): number => {
    if (node.position === "first") return -1_000_000 + node.configOrder;
    if (node.position === "last") return 1_000_000 + node.configOrder;
    if (node.position === "base") return node.baseOrder * 1000;
    const target = nodes.get(keyOf(node.target!));
    return target ? rank(target) - 1 : 0;
  };

  const orderedKeys: string[] = [];
  const available = [...nodes.values()].filter((node) => indegree.get(node.key) === 0);
  while (available.length) {
    available.sort((a, b) => rank(a) - rank(b) || a.configOrder - b.configOrder || a.baseOrder - b.baseOrder);
    const node = available.shift()!;
    orderedKeys.push(node.key);
    for (const next of edges.get(node.key)!) {
      const nextDegree = indegree.get(next)! - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) available.push(nodes.get(next)!);
    }
  }
  if (orderedKeys.length !== nodes.size) throw new Error("分组位置形成循环，请检查 before 配置");
  return orderedKeys.map((key) => nodes.get(key)!.rule);
}

export function buildGroupRules(customRules?: CustomGroupRule[]): GroupRule[] {
  if (!customRules?.length) return [...BUILTIN_GROUP_RULES];
  const { nodes, customNodes } = createEffectiveNodes(customRules);
  return stableOrder(nodes, customNodes);
}

export function getGroupDisplayName(groupName: string, rules: readonly GroupRule[] = BUILTIN_GROUP_RULES): string {
  return keyOf(groupName) === "default"
    ? "其他"
    : (rules.find((rule) => keyOf(rule.name) === keyOf(groupName))?.name ?? groupName);
}

export function groupModels(models: string[], rules: readonly GroupRule[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  const defaultRule = rules.find((rule) => keyOf(rule.name) === "default");
  const defaultName = defaultRule?.name ?? "default";
  for (const model of models) {
    const modelLower = model.toLowerCase();
    const matchingRule = rules.find(
      (rule) =>
        keyOf(rule.name) !== "default" && rule.keywords?.some((keyword) => modelLower.includes(keyword.toLowerCase())),
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
