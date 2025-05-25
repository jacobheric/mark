import { createDefine } from "fresh";

export interface State {
  title?: string;
  description?: string;
  noIndex?: boolean;
  script?: string;
  pocketCode?: string | null;
  pocketToken?: string | null;
}

export const define = createDefine<State>();
