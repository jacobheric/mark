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
