import type { PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>mark</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="text-black dark:text-white bg-white dark:bg-gray-900">
        <Component />
      </body>
    </html>
  );
}
