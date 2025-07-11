import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { Mark } from "../islands/mark.tsx";
import { deleteMark, getMark, upsertMark } from "../lib/marks.ts";

type MarkProps = {
  url?: string;
  title?: string;
  tags?: string[];
  success?: boolean;
  error?: string;
  deleted?: boolean;
};

export const handler = define.handlers<MarkProps>({
  async GET(ctx) {
    const url = ctx.url.searchParams.get("url") ?? "";
    const title = ctx.url.searchParams.get("title") ?? "";
    const mark = url ? await getMark(url) : null;

    return page({
      url,
      title: title || mark?.value?.title,
      tags: mark?.value?.tags,
      dateAdded: mark?.value?.dateAdded,
    });
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const url = form.get("url")?.toString();
    const d = form.get("deleteMark")?.toString();

    if (!url) {
      return page({
        error: "url is required",
      });
    }

    if (d === "true") {
      await deleteMark(url);
      return page({
        deleted: true,
      });
    }

    const tags = form.getAll("tags[]").map((tag) => tag.toString());
    const title = form.get("title")?.toString();

    try {
      await upsertMark({
        url,
        tags,
        ...(title ? { title } : {}),
      });
    } catch (e) {
      console.error("error saving mark", e);
      return page({
        url,
        title,
        tags,
        error: "Error saving mark",
      });
    }

    return page({
      url,
      title,
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
        title={data.title}
        tags={data.tags}
        success={data.success}
        error={data.error}
        deleted={data.deleted}
      />
    );
  },
);
