// Run locally with: deno run --allow-net --allow-write --allow-env export_kv.ts

import { OLD_DENO_KV_ACCESS_TOKEN } from "../config.ts";

Deno.env.set("DENO_KV_ACCESS_TOKEN", OLD_DENO_KV_ACCESS_TOKEN || "");
const kv = await Deno.openKv(
  "https://api.deno.com/databases/25d38e1c-acfa-4a13-93e7-500e40663456/connect",
);

const data: Record<string, unknown> = {};
let count = 0;

for await (const entry of kv.list({ prefix: [] })) {
  data[JSON.stringify(entry.key)] = entry.value;
  count++;
  if (count % 100 === 0) console.log(`Exported ${count} entries...`);
}

await Deno.writeTextFile("kv_dump.json", JSON.stringify(data, null, 2));

console.log(`✅ Export complete: ${count} entries written to kv_dump.json`);
kv.close();
