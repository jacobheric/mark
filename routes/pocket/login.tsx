import { POCKET_CONSUMER_KEY } from "@/lib/config.ts";
import { define, type State } from "@/lib/state.ts";
import { setCookie } from "@/lib/utils.ts";
import { FreshContext } from "fresh";
import { getCookies } from "@std/http/cookie";

const POCKET_AUTH_URL = "https://getpocket.com/auth/authorize";

const getPocketCode = async (ctx: FreshContext<State>) => {
  const response = await fetch("https://getpocket.com/v3/oauth/request", {
    headers: {
      "Content-Type": "application/json",
      "X-Accept": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      consumer_key: POCKET_CONSUMER_KEY,
      redirect_uri: `${ctx.url.origin}/pocket/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get pocket code");
  }
  const { code } = await response.json();

  return code;
};

export const handler = define.handlers({
  async GET(ctx) {
    const pocketCode = await getPocketCode(ctx);
    const redirect = new Response("", {
      status: 307,
      headers: {
        Location:
          `${POCKET_AUTH_URL}?request_token=${pocketCode}&redirect_uri=${ctx.url.origin}/pocket/callback`,
      },
    });

    setCookie(redirect.headers, "pocketCode", pocketCode);
    return redirect;
  },
});

export default function PocketLogin() {
  return (
    <div className="m-8">
      something went wrong...maybe check the console
    </div>
  );
}
