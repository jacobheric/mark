import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { allMarks, MarkType } from "../lib/marks.ts";
import Marks from "../components/marks.tsx";

export const handler = define.handlers({
  async GET() {
    const marks = await allMarks();

    return page({
      marks: (marks as { value: MarkType }[]).map(({ value }) => value),
    });
  },
});

export default define.page(
  function Home({ data }: PageProps<{ marks: MarkType[] }>) {
    return <Marks marks={data.marks} />;
  },
);
