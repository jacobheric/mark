import { kv } from "./kv/kv.ts";

export type MarkType = {
  url: string;
  title: string;
  dateAdded: number;
  image: string;
  excerpt: string;
  tags: string[];
};

export const allMarks = async () =>
  await Array.fromAsync(kv.list({ prefix: ["marks"] }));

export const searchMarks = async (query: string) => {
  const marks = await Array.fromAsync(kv.list<MarkType>({ prefix: ["marks"] }));
  return marks.filter((mark) =>
    fuzzyIncludes(query, mark.value.url) ||
    fuzzyIncludes(query, mark.value.title) ||
    mark.value.tags.some((tag) => fuzzyIncludes(query, tag))
  );
};
export const pagedMarks = (options?: Deno.KvListOptions) => {
  return kv.list<MarkType>({ prefix: ["marks"] }, options);
};

export const pagedMarksByTag = (tag: string, options?: Deno.KvListOptions) => {
  return kv.list<MarkType>({ prefix: ["tags", tag] }, options);
};

export const pagedTags = (options?: Deno.KvListOptions) => {
  return kv.list({ prefix: ["tags"] }, options);
};

export const allTags = async () =>
  await Array.fromAsync(kv.list({ prefix: ["tags"] }));

export const upsertMark = async (mark: {
  url: string;
  tags: string[];
  title?: string | null;
}) =>
  await kv.set(["marks", mark.url], {
    ...mark,
    dateAdded:
      (await kv.get<MarkType>(["marks", mark.url]))?.value?.dateAdded ??
        Date.now(),
  });

export const getMark = async (url: string) =>
  await kv.get<MarkType>(["marks", url]);

export const deleteMark = async (url: string) =>
  await kv.delete(["marks", url]);

export const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[m][n];
};

const fuzzyIncludes = (
  query: string,
  text?: string,
  maxDistance = 1,
): boolean => {
  if (!text) {
    return false;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText.includes(lowerQuery)) {
    return true;
  }

  const words = lowerText.split(/[^a-z0-9]+/i);
  for (const word of words) {
    if (Math.abs(word.length - lowerQuery.length) > maxDistance) {
      continue;
    }

    const distance = levenshtein(word, lowerQuery);
    if (distance <= maxDistance) {
      return true;
    }
  }

  return false;
};
