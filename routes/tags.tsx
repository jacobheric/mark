import { define, redirect } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { kvAll } from "../lib/kv/kv.ts";
import { pagedTags } from "../lib/marks.ts";

type TagsProps = {
  tags: Record<string, number>;
};

export const handler = define.handlers<TagsProps>({
  async GET() {
    const iter = pagedTags();
    const raw = await kvAll(iter);

    const tags = raw.reduce((acc, { key }) => {
      const tag = key[1] as string;
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return page({
      tags,
    });
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const tag = form.get("tag");
    if (!tag) {
      return new Response("tag is required", { status: 400 });
    }

    return redirect(`/?tag=${tag}`);
  },
});

export default define.page(
  function Tags({ data }: PageProps<TagsProps>) {
    return (
      <div className="text-sm flex flex-row gap-4 items-center flex-wrap m-8 justify-start">
        {Object.entries(data.tags).sort((a, b) => b[1] - a[1]).map((
          [tag, count],
        ) => (
          <form method="post">
            <input type="hidden" name="tag" value={tag} />
            <button
              type="submit"
              key={tag}
              className="bg-gray-100 dark:bg-gray-900 rounded-md p-2 flex flex-row gap-2 items-center"
            >
              <span className="text-sm font-medium">{tag}</span> |
              <span className="text-xs text-gray-400">
                {count}
              </span>
            </button>
          </form>
        ))}
      </div>
    );
  },
);
