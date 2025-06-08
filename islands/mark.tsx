import { useEffect, useRef, useState } from "preact/hooks";

export type MarkProps = {
  url?: string;
  tags?: string[];
  success?: boolean;
  error?: string;
};

const Tag = (
  { defaultValue, another, inputRef }: {
    defaultValue?: string;
    another: () => void;
    inputRef?: (el: HTMLInputElement | null) => void;
  },
) => {
  return (
    <div class="flex flex-row items-center gap-2">
      <input
        name="tags[]"
        type="text"
        placeholder="add a tag"
        defaultValue={defaultValue}
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            another();
          }
        }}
      />
      <button
        className="hover:border-red-500 hover:bg-red-100 hover:text-red-500"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.currentTarget.parentElement?.remove();
        }}
      >
        delete
      </button>
    </div>
  );
};

export const Mark = ({ url, tags = [""], success, error }: MarkProps) => {
  const [tagList, setTagList] = useState<string[]>(tags);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const another = () => setTagList((prev) => [...prev, ""]);

  useEffect(() => {
    inputRefs.current.length &&
      inputRefs.current[inputRefs.current.length - 1]?.focus();
  }, [tagList.length]);

  return (
    <div class="flex flex-col gap-4 m-8 text-sm">
      <form class="flex flex-col gap-2" method="post">
        <div>
          <input
            type="text"
            name="url"
            value={url}
            placeholder="url"
            required
          />
        </div>

        <input type="hidden" name="url" value={url} />
        <div class="flex flex-col gap-1" id="tags">
          {tagList.map((tag, i) => (
            <Tag
              key={tag + i}
              defaultValue={tags[i] || ""}
              another={another}
              inputRef={(el) => (inputRefs.current[i] = el)}
            />
          ))}
        </div>
        <button
          type="button"
          className="w-fit"
          onClick={another}
        >
          add another
        </button>
        <hr />
        <button type="submit" className=" w-fit">save</button>
        <div className="text-md">
          {success && <div>Saved!</div>}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </form>
    </div>
  );
};
