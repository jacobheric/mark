import { POCKET_CONSUMER_KEY } from "@/lib/config.ts";
import { define, type State } from "@/lib/state.ts";
import { setCookie } from "@/lib/utils.ts";
import { FreshContext } from "fresh";
import { getCookies } from "@std/http/cookie";

const fetchPocketToken = async (ctx: FreshContext<State>) => {
  const code = getCookies(ctx.req.headers).pocketCode;

  if (!code) {
    throw new Error("Pocket authorization code missing");
  }

  const tokenResponse = await fetch(
    "https://getpocket.com/v3/oauth/authorize",
    {
      headers: {
        "Content-Type": "application/json",
        "X-Accept": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        consumer_key: POCKET_CONSUMER_KEY,
        code,
      }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to get pocket auth token");
  }

  const { access_token } = await tokenResponse.json();
  ctx.state.pocketToken = access_token;

  const response = new Response("", {
    status: 307,
    headers: { Location: "/pocket/import" },
  });
  setCookie(response.headers, "pocketToken", access_token);

  return response;
};

export const handler = define.handlers({
  async GET(ctx) {
    return await fetchPocketToken(ctx);
  },
});

export default function PocketCallback() {
  return <div>Pocket Callback</div>;
}
