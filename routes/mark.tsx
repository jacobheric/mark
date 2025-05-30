import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { allMarks, getMark, MarkType, upsertMark } from "../lib/marks.ts";
import Marks from "../components/marks.tsx";
import { Mark } from "../islands/mark.tsx";
import { fromFileUrl } from "jsr:@std/path@0.221/from-file-url";

type MarkProps = {
  url: string;
  tags?: string[];
  success?: boolean;
  error?: string;
};

export const handler = define.handlers<MarkProps>({
  async GET(ctx) {
    const url = ctx.url.searchParams.get("url") ?? "";
    const mark = await getMark(url);

    return page({
      url,
      tags: mark?.value?.tags,
      dateAdded: mark?.value?.dateAdded,
    });
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const url = form.get("url")?.toString();

    if (!url) {
      return new Response("url is required", { status: 400 });
    }

    const tags = form.getAll("tags[]").map((tag) => tag.toString());

    try {
      await upsertMark({
        url,
        tags,
      });
    } catch (e) {
      return page({
        url,
        tags,
        error: "Error saving tags",
      });
    }

    return page({
      url,
      tags,
      success: true,
    });
  },
});

export default define.page(
  function MarkRoute({ data }: PageProps<MarkProps>) {
    return (
      <Mark
        url={data.url}
        tags={data.tags}
        success={data.success}
        error={data.error}
      />
    );
  },
);
