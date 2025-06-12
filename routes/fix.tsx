import { define } from "@/lib/utils.ts";

import { page, PageProps } from "fresh";

import { fixDates } from "../lib/marks.ts";

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
