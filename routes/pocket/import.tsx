import { allSaves, importSaves, SaveType } from "@/lib/pocket.ts";
import { define } from "@/lib/state.ts";
import { getCookies } from "@std/http/cookie";
import { page, PageProps } from "fresh";
import { MarkType } from "../../lib/marks.ts";
import Marks from "../../components/marks.tsx";

type SavesType = {
  saves: MarkType[];
};

export const handler = define.handlers<SavesType>({
  async GET(ctx) {
    const pocketToken = getCookies(ctx.req.headers).pocketToken;

    return page({ saves: await allSaves(pocketToken) });
  },
  async POST(ctx) {
    const pocketToken = getCookies(ctx.req.headers).pocketToken;
    await importSaves(pocketToken);
    return new Response("OK");
  },
});

export default function PocketImport({ data }: PageProps<SavesType>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <form method="post">
          <button type="submit" className="m-6">
            Import
          </button>
        </form>
      </div>
      <Marks marks={data.saves} />;
    </div>
  );
}
