import { POCKET_CONSUMER_KEY } from "./config.ts";
import { kv } from "./kv.ts";
import { MarkType } from "./marks.ts";

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

export type ResultType = {
  list: {
    [key: string]: Save;
  };
  status: number;
  total: number;
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
      count: 10,
      offset: offset,
      total: 1,
      sort: "newest",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get pocket saves page");
  }

  return await response.json();
};

export const allSaves = async (pocketToken: string): Promise<MarkType[]> => {
  let offset = 0;
  const saves: MarkType[] = [];

  while (true) {
    try {
      const response = await savesPage(pocketToken, offset);
      const { list }: ListType = response;

      if (Object.keys(list).length === 0) {
        console.log("no more saves, breaking");
        break;
      }

      saves.push(
        ...Object.values(list).map((item) => ({
          url: item.resolved_url,
          title: item.resolved_title,
          dateAdded: item.time_added,
          image: item.top_image_url,
          excerpt: item.excerpt,
          tags: item.tags ? Object.keys(item.tags) : [],
        })),
      );

      offset += 30;

      await sleep(1000);
    } catch (error) {
      console.log("fetch error, breaking", error);
      break;
    }
  }
  return saves.sort((a, b) => b.dateAdded - a.dateAdded);
};

export const importSaves = async (pocketToken: string) => {
  const saves = await allSaves(pocketToken);

  for (const save of saves) {
    kv.set(["marks", save.url], {
      url: save.url,
      excerpt: save.excerpt,
      title: save.title,
      image: save.image,
      dateAdded: save.dateAdded,
      tags: save.tags,
    });
  }

  const entries = kv.list({ prefix: ["marks"] });
  for await (const entry of entries) {
    console.log("entry", entry);
  }
};
