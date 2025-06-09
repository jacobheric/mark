import { MarkType } from "../lib/marks.ts";
import IconEdit from "tabler-icons/tsx/edit.tsx";

export default function Marks(
  { marks, cursor, tag }: {
    marks: MarkType[];
    cursor?: string;
    tag?: string | null;
  },
) {
  return (
    <div className="flex flex-col gap-6">
      {marks.map(
        (item: MarkType) => (
          <>
            <div
              key={item.dateAdded}
              className="flex flex-col gap-2"
            >
              <div className="flex flex-col items-start wrap text-sm gap-2">
                {
                  /* <img
                className="max-h-24"
                src={item.image}
              /> */
                }

                <div className="flex flex-row gap-2 items-center">
                  <a href={item.url} target="_blank">
                    {item.title}
                  </a>
                  <a
                    href={`/mark?url=${encodeURIComponent(item.url)}`}
                    className="cursor-pointer"
                  >
                    <IconEdit size={16} />
                  </a>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-300 flex flex-col gap-1">
                  <div>{item.url}</div>
                  <div>{new Date(item.dateAdded).toLocaleString()}</div>
                  <div>{item.excerpt}</div>
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-start wrap text-sm text-gray-500 dark:text-gray-300 gap-2">
                {item.tags
                  ?.map((tag) => (
                    <div key={tag}>
                      <a href={`/?tag=${tag}`}>{tag}</a>
                    </div>
                  ))}
              </div>
            </div>
            <hr />
          </>
        ),
      )}
      <div>
        {cursor &&
          (
            <a href={`/?cursor=${cursor}${tag ? `&tag=${tag}` : ""}`}>
              next &#8594;
            </a>
          )}
      </div>
    </div>
  );
}
