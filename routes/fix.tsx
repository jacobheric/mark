import { define } from "@/lib/utils.ts";

import { FreshContext, page, PageProps } from "fresh";

import Marks from "../components/marks.tsx";
import {
  fixDates,
  MarkType,
  pagedMarks,
  pagedMarksByTag,
  searchMarks,
} from "../lib/marks.ts";
import { kvValues } from "../lib/kv/kv.ts";

type FixProps = {
  success?: boolean;
};

export const handler = define.handlers<FixProps>({
  async GET() {
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
        <form className="w-full">
          <button type="submit">Fix Dates</button>
        </form>
      </div>
    );
  },
);
