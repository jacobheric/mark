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
    <div className="m-8 flex flex-col gap-2">
      {marks.map(
        (item: MarkType) => (
          <div
            key={item.dateAdded}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col items-start wrap text-sm gap-2">
              <div className="flex flex-row gap-2 items-center">
                <a href={item.url} target="_blank">
                  {item.title}
                </a>
                <a href={`/mark?url=${item.url}`} className="cursor-pointer">
                  <IconEdit size={16} />
                </a>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {new Date(item.dateAdded).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {item.excerpt}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                <img
                  className="max-h-24"
                  src={item.image}
                  alt={item.title}
                />
              </div>
            </div>
            <div className="flex flex-col items-start wrap text-sm text-gray-500 dark:text-gray-300">
              {item.tags
                ?.map((tag) => <div key={tag}>{tag}</div>)}
            </div>
            <hr />
          </div>
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
