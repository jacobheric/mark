import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { allMarks, fixDates, MarkType } from "../lib/marks.ts";

type FixProps = {
  success?: boolean;
  marks?: Deno.KvEntry<MarkType>[];
};

export const handler = define.handlers<FixProps>({
  async GET() {
    const marks = await allMarks();
    return page({
      marks,
    });
  },
  async POST() {
    await fixDates();
    return page({
      success: true,
    });
  },
});

export default define.page(
  function Fix({ data }: PageProps<FixProps>) {
    return (
      <div class="flex flex-col gap-8">
        {data.success && <div class="m-6">Success!</div>}
        <form className="w-full" method="post">
          <button type="submit">Fix Dates</button>
        </form>
        <pre>{JSON.stringify(data.marks, null, 2)}</pre>
      </div>
    );
  },
);
