import { MarkType } from "../lib/marks.ts";

export default function Marks(
  { marks, cursor }: { marks: MarkType[]; cursor?: string },
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
              <div>
                <a href={item.url} target="_blank">
                  {item.title}
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
          <a href={`/?cursor=${cursor}`}>next &#8594;</a>}
      </div>
    </div>
  );
}
