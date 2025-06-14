import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { allMarksByDateAdded, fixDates, MarkType } from "../lib/marks.ts";

type FixProps = {
  success?: boolean;
  marks?: Deno.KvEntry<MarkType>[];
  length?: number;
};

export const handler = define.handlers<FixProps>({
  async GET() {
    const marks = await allMarksByDateAdded();
    return page({
      marks,
      length: marks.length,
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
