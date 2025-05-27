import { MarkType } from "../lib/marks.ts";

export default function Marks({ marks }: { marks: MarkType[] }) {
  return (
    <div className="p-8 ">
      {marks.map(
        (item: MarkType) => (
          <div
            key={item.dateAdded}
            className="border-b flex flex-col border-gray-200 gap-2 p-2"
          >
            <div className="flex flex-col items-start wrap text-sm gap-2">
              <div>
                <a href={item.url} target="_blank">
                  {item.title}
                </a>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.dateAdded * 1000).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                {item.excerpt}
              </div>
              <div className="text-xs text-gray-500">
                <img
                  className="max-h-24"
                  src={item.image}
                  alt={item.title}
                />
              </div>
            </div>
            <div className="flex flex-col items-start wrap text-sm text-gray-500">
              {item.tags
                ?.map((tag) => <div key={tag}>{tag}</div>)}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
