import { define } from "@/lib/utils.ts";
import { suggestBookmarkTags } from "@/lib/openai.ts";

type SuggestTagsBody = {
  url?: unknown;
  title?: unknown;
  existingTags?: unknown;
};

const toString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const handler = define.handlers({
  async POST(ctx) {
    let body: SuggestTagsBody;
    try {
      body = await ctx.req.json();
    } catch {
      return Response.json({ error: "invalid request body" }, { status: 400 });
    }

    const url = toString(body.url);
    const title = toString(body.title);
    const existingTags = toStringArray(body.existingTags);

    if (!url) {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    try {
      const tags = await suggestBookmarkTags({ url, title, existingTags });
      return Response.json({ tags });
    } catch (e) {
      console.error("error suggesting tags", e);
      return Response.json(
        { error: "Unable to suggest tags right now" },
        { status: 502 },
      );
    }
  },
});
