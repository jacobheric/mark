import { createDefine } from "fresh";
import { State } from "./state.ts";

import { setCookie as internalSetCookie } from "@std/http/cookie";

export const define = createDefine<State>();

export const redirect = (url: string) =>
  new Response("", {
    status: 307,
    headers: { Location: url },
  });

export const logFormData = (data: FormData) => {
  for (const pair of data) {
    console.log(pair[0] + ", " + pair[1]);
  }
};

export const setCookie = (
  headers: Headers,
  name: string,
  value: string,
) =>
  internalSetCookie(headers, {
    name,
    path: "/",
    value,
    maxAge: 400 * 24 * 60 * 60,
  });

export const getTitle = async (url: string): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    clearTimeout(timeoutId);

    const html = await response.text();
    const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Failed to fetch title from ${url}:`, err.message);
    }
    return null;
  }
};
