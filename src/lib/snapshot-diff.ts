export type DiffEntry = {
  path: string;
  type: "added" | "removed" | "changed";
  prev: unknown;
  next: unknown;
};

export function diffSnapshots(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): DiffEntry[] {
  const entries: DiffEntry[] = [];
  diffRecursive(prev, next, "", entries);
  return entries;
}

function diffRecursive(
  a: unknown,
  b: unknown,
  prefix: string,
  entries: DiffEntry[],
): void {
  if (a === b) return;

  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object" ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    entries.push({
      path: prefix || "(root)",
      type: a === undefined ? "added" : b === undefined ? "removed" : "changed",
      prev: a,
      next: b,
    });
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = prefix ? `${prefix}[${i}]` : `[${i}]`;
      if (i >= a.length) {
        entries.push({ path: childPath, type: "added", prev: undefined, next: b[i] });
      } else if (i >= b.length) {
        entries.push({ path: childPath, type: "removed", prev: a[i], next: undefined });
      } else {
        diffRecursive(a[i], b[i], childPath, entries);
      }
    }
    return;
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

  for (const key of allKeys) {
    const childPath = prefix ? `${prefix}.${key}` : key;
    if (!(key in aObj)) {
      entries.push({ path: childPath, type: "added", prev: undefined, next: bObj[key] });
    } else if (!(key in bObj)) {
      entries.push({ path: childPath, type: "removed", prev: aObj[key], next: undefined });
    } else {
      diffRecursive(aObj[key], bObj[key], childPath, entries);
    }
  }
}
