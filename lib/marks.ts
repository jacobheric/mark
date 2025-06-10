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

const getScore = (query: string, mark: MarkType): number => {
  const scores = [
    fuzzyIncludes(query, mark.url),
    fuzzyIncludes(query, mark.title),
    ...mark.tags.map((tag) => fuzzyIncludes(query, tag)),
  ];
  return Math.max(...scores);
};

export const searchMarks = async (query: string) => {
  const marks = await Array.fromAsync(kv.list<MarkType>({ prefix: ["marks"] }));

  return marks
    .map((mark) => ({
      mark,
      score: getScore(query, mark.value),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.mark);
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
): number => {
  if (!text) {
    return 0;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const words = lowerText.split(/[^a-z0-9]+/i);

  if (words.includes(lowerQuery)) {
    return 3;
  }

  if (lowerText.includes(lowerQuery)) {
    return 2;
  }

  let score = 0;

  for (const word of words) {
    if (Math.abs(word.length - lowerQuery.length) > maxDistance) {
      continue;
    }

    const distance = levenshtein(word, lowerQuery);
    if (distance <= maxDistance) {
      score = distance;
    }
  }

  return score;
};
