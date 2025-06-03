import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import Marks from "../components/marks.tsx";
import { MarkType, pagedMarks } from "../lib/marks.ts";
import { kvValues } from "../lib/kv.ts";

type MarksProps = {
  marks: MarkType[];
  cursor: string;
};

export const handler = define.handlers<MarksProps>({
  async GET(ctx) {
    const url = new URL(ctx.req.url);
    const iter = pagedMarks({
      cursor: url.searchParams.get("cursor") ?? "",
      limit: 20,
    });

    const marks = await kvValues(iter);

    return page({
      marks,
      cursor: iter.cursor,
    });
  },
});

export default define.page(
  function Home({ data }: PageProps<MarksProps>) {
    return <Marks marks={data.marks} cursor={data.cursor} />;
  },
);
