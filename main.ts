import { App, fsRoutes, staticFiles } from "fresh";
import { define, redirect } from "@/lib/utils.ts";
import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import "@std/dotenv/load";
import { type State } from "./lib/state.ts";

const unrestricted = [
  "/auth",
];

export const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

export const app = new App<State>();

app.use(staticFiles());

// this is the same as the /api/:name route defined via a file. feel free to delete this!
app.get("/auth/signin", async (ctx) => {
  return await signIn(ctx.req);
});

app.get("/auth/callback", async (ctx) => {
  const { response } = await handleCallback(ctx.req);
  return response;
});

app.get("/auth/signout", async (ctx) => {
  return await signOut(ctx.req);
});

const authMiddleware = define.middleware(async (ctx) => {
  const url = new URL(ctx.req.url);

  if (Deno.env.get("PRODUCTION") !== "true") {
    return ctx.next();
  }

  if (
    unrestricted.some((route) => url.pathname.startsWith(route))
  ) {
    return ctx.next();
  }

  if (await getSessionId(ctx.req) === undefined) {
    return redirect(
      "/auth/signin",
    );
  }
  return ctx.next();
});
app.use(authMiddleware);

await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) {
  await app.listen();
}
