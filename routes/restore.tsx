import { define } from "@/lib/state.ts";
import { page, PageProps } from "fresh";
import { restore } from "../lib/kv/restore.ts";

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

    const file = form.get("file") as File;

    if (!file) {
      return page({
        error: "file is required",
      });
    }

    await restore(file);
    return page({
      success: true,
    });
  },
});

export default function Restore({ data }: PageProps<ImportProps>) {
  return (
    <div className="flex flex-col gap-4 m-8 mx-auto">
      <form
        method="post"
        className="flex flex-col gap-2"
        encType="multipart/form-data"
      >
        <input type="file" name="file" required className="w-96" />
        <button type="submit" className="w-fit cursor-pointer">
          Import from json dump
        </button>
      </form>
      <div className="text-md">
        {data.success && <div>Success!</div>}
        {data.error && <div className="text-red-500">{data.error}</div>}
      </div>
    </div>
  );
}
