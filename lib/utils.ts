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
