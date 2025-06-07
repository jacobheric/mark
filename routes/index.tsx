import { define } from "@/lib/utils.ts";

import { FreshContext, page, PageProps } from "fresh";

import Marks from "../components/marks.tsx";
import { MarkType, pagedMarks, pagedMarksByTag } from "../lib/marks.ts";
import { kvValues } from "../lib/kv/kv.ts";

const limit = 50;

type MarksProps = {
  marks: MarkType[];
  cursor: string;
  tag: string | null;
};

const getMarks = async (ctx: FreshContext) => {
  const url = new URL(ctx.req.url);
  const tag = url.searchParams.get("tag");
  const cursor = url.searchParams.get("cursor") ?? "";

  const iter = tag
    ? pagedMarksByTag(tag, {
      cursor,
      limit,
    })
    : pagedMarks({
      cursor,
      limit,
    });

  const marks = await kvValues(iter);

  return page({
    tag,
    marks,
    cursor: iter.cursor,
  });
};

export const handler = define.handlers<MarksProps>({
  async GET(ctx) {
    return await getMarks(ctx);
  },
  async POST(ctx) {
    return await getMarks(ctx);
  },
});

export default define.page(
  function Home({ data }: PageProps<MarksProps>) {
    return <Marks marks={data.marks} cursor={data.cursor} tag={data.tag} />;
  },
);
