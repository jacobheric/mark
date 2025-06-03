import { kv } from "./kv.ts";

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

export const upsertMark = async (mark: { url: string; tags: string[] }) =>
  await kv.set(["marks", mark.url], {
    ...mark,
    dateAdded:
      (await kv.get<MarkType>(["marks", mark.url]))?.value?.dateAdded ??
        Date.now(),
  });

export const getMark = async (url: string) =>
  await kv.get<MarkType>(["marks", url]);
