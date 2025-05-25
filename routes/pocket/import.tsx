import { POCKET_CONSUMER_KEY } from "@/lib/config.ts";
import { define, type State } from "@/lib/state.ts";
import { setCookie } from "@/lib/utils.ts";
import { FreshContext, page, PageProps } from "fresh";
import { getCookies } from "@std/http/cookie";

type Save = {
  item_id: string;
  given_url: string;
  tags: {
    item_id: string;
    tag: string;
  };
};

type ResultType = {
  list: {
    [key: string]: Save;
  };
};

export const handler = define.handlers<ResultType>({
  async GET(ctx) {
    const pocketToken = getCookies(ctx.req.headers).pocketToken;
    const response = await fetch("https://getpocket.com/v3/get", {
      headers: {
        "Content-Type": "application/json",
        "X-Accept": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        consumer_key: POCKET_CONSUMER_KEY,
        access_token: pocketToken,
        count: 30,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get pocket saves");
    }
    const { list } = await response.json();

    return page({ list });
  },
});

export default function PocketImport({ data }: PageProps<ResultType>) {
  return (
    <div className="m-8">
      {Object.values(data.list).map((item: Save) => (
        <div key={item.item_id} className="border-b border-gray-200">
          <p>{item.given_url}</p>
          <p>{JSON.stringify(item.tags)}</p>
        </div>
      ))}
    </div>
  );
}
