import type { Issue } from '../types';

export interface IssueNode {
  issue: Issue;
  depth: number;
}

/**
 * Takes a flat list of issues and returns them in tree order:
 * parent first, then each parent's children immediately after (recursively),
 * with a depth counter so the UI can indent them.
 *
 * Issues whose parentIssueId is NOT in the current list are treated as roots.
 */
export function buildOrderedIssues(issues: Issue[]): IssueNode[] {
  const ids = new Set(issues.map((i) => i.id));

  // Map parentId → children[]
  const childMap = new Map<number, Issue[]>();
  const roots: Issue[] = [];

  for (const issue of issues) {
    if (issue.parentIssueId && ids.has(issue.parentIssueId)) {
      const arr = childMap.get(issue.parentIssueId) ?? [];
      arr.push(issue);
      childMap.set(issue.parentIssueId, arr);
    } else {
      roots.push(issue);
    }
  }

  const result: IssueNode[] = [];

  function collect(issue: Issue, depth: number) {
    result.push({ issue, depth });
    const kids = childMap.get(issue.id) ?? [];
    for (const kid of kids) {
      collect(kid, depth + 1);
    }
  }

  for (const root of roots) {
    collect(root, 0);
  }

  return result;
}
