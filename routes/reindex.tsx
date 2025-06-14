import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { allMarks, MarkType, reindex } from "../lib/marks.ts";

type FixProps = {
  success?: boolean;
  marks?: Deno.KvEntry<MarkType>[];
  length?: number;
};

export const handler = define.handlers<FixProps>({
  async GET() {
    const marks = await allMarks();
    return page({
      marks,
      length: marks.length,
    });
  },
  async POST() {
    await reindex();
    const marks = await allMarks();
    return page({
      success: true,
      marks,
      length: marks.length,
    });
  },
});

export default define.page(
  function Reindex({ data }: PageProps<FixProps>) {
    return (
      <div class="flex flex-col gap-8">
        {data.success && <div class="m-6">Success!</div>}
        <form className="w-full" method="post">
          <button type="submit">reindex</button>
        </form>
        <div class="flex flex-col gap-2">
          <div>
            {data.length} marks
          </div>
          <pre>{JSON.stringify(data.marks, null, 2)}</pre>
        </div>
      </div>
    );
  },
);
