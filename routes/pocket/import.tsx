import { importCsv, importSaves } from "@/lib/pocket.ts";
import { define } from "@/lib/state.ts";
import { getCookies } from "@std/http/cookie";
import { page, PageProps } from "fresh";

type ImportProps = {
  error?: string;
  success?: boolean;
};

export const handler = define.handlers<ImportProps>({
  GET() {
    return page({});
  },
  async POST(ctx) {
    const form = await ctx.req.formData();
    const type = form.get("type")?.toString();

    if (type === "api") {
      const pocketToken = getCookies(ctx.req.headers).pocketToken;
      await importSaves(pocketToken);
      return new Response("that worked!");
    }

    const file = form.get("file") as File;

    if (!file) {
      return page({
        error: "file is required",
      });
    }

    await importCsv(file);
    return page({
      success: true,
    });
  },
});

export default function PocketImport({ data }: PageProps<ImportProps>) {
  return (
    <div className="flex flex-col gap-4 m-8 mx-auto">
      <form method="post">
        <input type="hidden" name="type" value="api" />
        <button type="submit">
          Import from Pocket API
        </button>
      </form>
      <div className="text-lg font-bold italic">or</div>
      <form
        method="post"
        className="flex flex-col gap-2"
        encType="multipart/form-data"
      >
        <input type="hidden" name="type" value="csv" />
        <input type="file" name="file" required className="w-96" />
        <button type="submit" className="w-fit">
          Import from CSV
        </button>
      </form>
      <div className="text-md">
        {data.success && <div>Success!</div>}
        {data.error && <div className="text-red-500">{data.error}</div>}
      </div>
    </div>
  );
}
