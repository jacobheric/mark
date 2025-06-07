import { POCKET_CONSUMER_KEY } from "./config.ts";
import { kv } from "./kv/kv.ts";
import { parse } from "jsr:@std/csv";

export type Tag = {
  [key: string]: {
    item_id: string;
    tag: string;
  };
};

export type Save = {
  item_id: string;
  resolved_url: string;
  resolved_title: string;
  top_image_url: string;
  excerpt: string;
  time_added: number;
  tags: {
    item_id: string;
    tag: Tag;
  };
};

export type ListType = {
  list: {
    [key: string]: Save;
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const savesPage = async (pocketToken: string, offset: number) => {
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
      offset: offset,
      total: 1,
      sort: "newest",
      state: "unread",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get pocket saves page");
  }

  return await response.json();
};

export const importSaves = async (pocketToken: string) => {
  let offset = 0;

  while (true) {
    try {
      console.log("fetching page", offset);
      const response = await savesPage(pocketToken, offset);
      const { list }: ListType = response;

      if (Object.keys(list).length === 0) {
        console.log("no more saves, breaking");
        break;
      }

      console.log("inserting batch to kv");
      for (const save of Object.values(list)) {
        if (!save.resolved_url) {
          console.log("no resolved url, skipping", save);
          continue;
        }

        await kv.set(["marks", save.resolved_url], {
          url: save.resolved_url,
          excerpt: save.excerpt,
          image: save.top_image_url,
          title: save.resolved_title,
          dateAdded: new Date(save.time_added * 1000).toISOString(),
          tags: save.tags ? Object.keys(save.tags) : [],
        });
      }

      offset += 30;
      //
      // sidestep pocket api rate limiting.
      console.log("batch inserted, sleeping");
      await sleep(250);
    } catch (error) {
      console.log("fetch error, breaking", error);
      break;
    }
  }
};

export const importCsv = async (file: File) => {
  const contents = await file.text();
  const data = parse(contents, { skipFirstRow: true });

  for (const row of data) {
    const key = ["marks", row.url];
    const tags = (row.tags as string)?.split("|").filter((t) => t) || [];
    const mark = {
      title: row.title,
      url: row.url,
      dateAdded: new Date(Number(row.time_added) * 1000).toISOString(),
      tags,
    };

    await kv.atomic()
      .check({ key, versionstamp: null })
      .set(key, mark)
      .commit();

    //
    // secondary index by tag
    await Promise.all(
      tags.filter((tag) => tag).map((tag) =>
        kv.atomic()
          .set(["tags", tag, row.url], mark)
          .commit()
      ),
    );
  }

  return data;
};
