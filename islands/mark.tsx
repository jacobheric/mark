import { useEffect, useRef, useState } from "preact/hooks";

export type MarkProps = {
  url?: string;
  title?: string;
  tags?: string[];
  success?: boolean;
  error?: string;
  deleted?: boolean;
};

const Tag = (
  { defaultValue, another, inputRef, formRef }: {
    defaultValue?: string;
    another: () => void;
    formRef: HTMLFormElement | null;
    inputRef: (el: HTMLInputElement | null) => void;
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
          if (e.key !== "Enter") {
            return;
          }

          e.preventDefault();

          if (e.currentTarget.value) {
            another();
            return;
          }

          formRef?.submit();
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

export const Mark = (
  { url, title, tags = [""], success, error, deleted }: MarkProps,
) => {
  const [tagList, setTagList] = useState<string[]>(tags);
  const [deleteMark, setDeleteMark] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const another = () => setTagList((prev) => [...prev, ""]);

  useEffect(() => {
    formRef.current?.addEventListener("submit", () => {
      if (saveRef.current) {
        saveRef.current.disabled = true;
        saveRef.current.textContent = "saving...";
      }
    });
  }, []);

  useEffect(() => {
    inputRefs.current.length &&
      inputRefs.current[inputRefs.current.length - 1]?.focus();
  }, [tagList.length]);

  useEffect(() => {
    if (deleteMark) {
      formRef.current?.submit();
    }
  }, [deleteMark]);

  return (
    <div class="flex flex-col gap-4 m-8 text-sm">
      <form
        ref={formRef}
        class="flex flex-col gap-2"
        method="post"
      >
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
        <input
          type="hidden"
          name="title"
          value={title}
        />
        <input
          type="hidden"
          name="deleteMark"
          value={deleteMark ? "true" : "false"}
        />
        <div class="flex flex-col gap-1" id="tags">
          {tagList.map((tag, i) => (
            <Tag
              key={tag + i}
              defaultValue={tags[i] || ""}
              another={another}
              formRef={formRef.current}
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
        <div className="flex flex-row gap-2">
          <button
            type="submit"
            className="w-24 disabled:opacity-50"
            ref={saveRef}
          >
            save
          </button>
          <button
            type="button"
            className="hover:border-red-500 hover:bg-red-100 hover:text-red-500 w-24 disabled:opacity-50"
            onClick={() => setDeleteMark(true)}
          >
            delete
          </button>
        </div>
        <div className="text-md">
          {success && <div>Saved!</div>}
          {deleted && (
            <div className="flex flex-row gap-2">
              <div>Deleted!</div>
              <a href="/">
                home &#8594;
              </a>
            </div>
          )}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </form>
    </div>
  );
};
