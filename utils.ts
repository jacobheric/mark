import { createDefine } from "fresh";

// deno-lint-ignore no-empty-interface
export interface State {}

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
