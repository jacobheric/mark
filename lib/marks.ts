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
