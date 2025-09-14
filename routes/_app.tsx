import type { PageProps } from "fresh";
import { define } from "../lib/state.ts";

function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>mark</title>

        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body class="text-black dark:text-white bg-white dark:bg-gray-900">
        <Component />
      </body>
    </html>
  );
}

export default define.page(App);
