import "@std/dotenv/load";

export const POCKET_CONSUMER_KEY = Deno.env.get("POCKET_CONSUMER_KEY");
export const OLD_DENO_KV_ACCESS_TOKEN = Deno.env.get(
  "OLD_DENO_KV_ACCESS_TOKEN",
);
export const NEW_DENO_KV_ACCESS_TOKEN = Deno.env.get(
  "NEW_DENO_KV_ACCESS_TOKEN",
);

export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
