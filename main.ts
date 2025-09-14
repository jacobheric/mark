/// <reference lib="deno.unstable" />
import { App, Context, staticFiles, trailingSlashes } from "fresh";
import { define, redirect } from "@/lib/utils.ts";
import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import "@std/dotenv/load";
import { type State } from "./lib/state.ts";

//
// shenanigans because @deno/kv-oauth requires GITHUB_ but github forbids these
// as env vars for CI actions
Deno.env.set("GITHUB_CLIENT_ID", Deno.env.get("GH_CLIENT_ID") || "");
Deno.env.set("GITHUB_CLIENT_SECRET", Deno.env.get("GH_CLIENT_SECRET") || "");

const AUTHORIZED_USERS = Deno.env.get("AUTHORIZED_USERS")?.split(",") || [];
const PRODUCTION = Deno.env.get("PRODUCTION") === "true";

const unrestricted = [
  "/auth",
];

export const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig({ scope: "read:user user:email" }),
);

export const app = new App<State>()
  .use(staticFiles())
  .use(trailingSlashes("never"));

app.get("/auth/signin", async (ctx: Context<State>) => {
  return await signIn(ctx.req);
});

app.get("/auth/callback", async (ctx: Context<State>) => {
  console.log("running auth/callback...");
  const { response, tokens } = await handleCallback(ctx.req);
  if (!PRODUCTION) {
    return response;
  }

  console.log("getting user...");
  const userResponse = await fetch("https://api.github.com/user", {
    method: "get",

    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  const user = await userResponse.json();
  console.log("got user", user);
  if (!AUTHORIZED_USERS.includes(user.login)) {
    console.log("user not authorized", user);
    await signOut(ctx.req);
    return new Response("Unauthorized", { status: 401 });
  }

  return response;
});

app.get("/auth/signout", async (ctx: Context<State>) => {
  return await signOut(ctx.req);
});

const authMiddleware = define.middleware(async (ctx) => {
  console.log("running authMiddleware...");
  const url = new URL(ctx.req.url);

  if (Deno.env.get("PRODUCTION") !== "true") {
    return ctx.next();
  }

  if (
    unrestricted.some((route) => url.pathname.startsWith(route))
  ) {
    return ctx.next();
  }

  console.log("getting sessionId...");

  const sessionId = await getSessionId(ctx.req);

  console.log("sessionId", sessionId);

  if (sessionId === undefined) {
    return redirect(
      "/auth/signin",
    );
  }
  return ctx.next();
});

app.use(authMiddleware);

export default app.fsRoutes();
