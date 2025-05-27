import { importSaves } from "@/lib/pocket.ts";
import { define } from "@/lib/state.ts";
import { getCookies } from "@std/http/cookie";
import { page } from "fresh";

export const handler = define.handlers({
  GET() {
    return page();
  },
  async POST(ctx) {
    const pocketToken = getCookies(ctx.req.headers).pocketToken;
    await importSaves(pocketToken);
    return new Response("OK");
  },
});

export default function PocketImport() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <form method="post">
          <button type="submit" className="m-6">
            Import
          </button>
        </form>
      </div>
    </div>
  );
}
