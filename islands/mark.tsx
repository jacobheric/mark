import { useEffect, useRef, useState } from "preact/hooks";

export type MarkProps = {
  url?: string;
  title?: string;
  tags?: string[];
  success?: boolean;
  error?: string;
  deleted?: boolean;
};

type SuggestTagsResponse = {
  tags?: string[];
  error?: string;
};

const uniqueTags = (values: string[]) => {
  const seen = new Set<string>();
  return values.reduce<string[]>((acc, value) => {
    const tag = value.trim();
    if (!tag) {
      return acc;
    }

    const key = tag.toLowerCase();
    if (seen.has(key)) {
      return acc;
    }

    seen.add(key);
    acc.push(tag);
    return acc;
  }, []);
};

const Tag = (
  { value, another, remove, update, inputRef, formRef }: {
    value: string;
    another: () => void;
    remove: () => void;
    update: (value: string) => void;
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
        value={value}
        ref={inputRef}
        onInput={(e) => update(e.currentTarget.value)}
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
          remove();
        }}
      >
        delete
      </button>
    </div>
  );
};

export const Mark = (
  { url, title, tags, success, error, deleted }: MarkProps,
) => {
  const [tagList, setTagList] = useState<string[]>(tags?.length ? tags : [""]);
  const [deleteMark, setDeleteMark] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionError, setSuggestionError] = useState("");
  const requestedForUrlRef = useRef<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const another = () => setTagList((prev) => [...prev, ""]);
  const updateTag = (index: number, value: string) =>
    setTagList((prev) => prev.map((tag, i) => i === index ? value : tag));
  const removeTag = (index: number) =>
    setTagList((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });

  const loadSuggestions = async (targetUrl: string, existingTags: string[]) => {
    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl) {
      setSuggestions([]);
      setSuggestionError("url is required to suggest tags");
      return;
    }

    setLoadingSuggestions(true);
    setSuggestionError("");

    try {
      const response = await fetch("/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          title,
          existingTags,
        }),
      });

      const data = (await response.json()) as SuggestTagsResponse;

      if (!response.ok) {
        setSuggestions([]);
        setSuggestionError(data.error ?? "unable to suggest tags");
        return;
      }

      const nextSuggestions = uniqueTags(data.tags ?? []).filter(
        (suggested) =>
          !existingTags.some(
            (existing) => existing.toLowerCase() === suggested.toLowerCase(),
          ),
      );

      setSuggestions(nextSuggestions);
      if (!nextSuggestions.length) {
        setSuggestionError("no suggestions found");
      }
    } catch {
      setSuggestions([]);
      setSuggestionError("unable to suggest tags");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadSuggestionsForCurrentUrl = () => {
    const targetUrl = urlInputRef.current?.value ?? "";
    const existingTags = uniqueTags(tagList);
    loadSuggestions(targetUrl, existingTags);
  };

  const addSuggestedTag = (suggestedTag: string) => {
    const hasTag = uniqueTags(tagList).some((tag) =>
      tag.toLowerCase() === suggestedTag.toLowerCase()
    );

    if (hasTag) {
      setSuggestions((prev) => prev.filter((tag) => tag !== suggestedTag));
      return;
    }

    const emptyIndex = tagList.findIndex((tag) => !tag.trim());
    if (emptyIndex >= 0) {
      setTagList((prev) =>
        prev.map((tag, i) => i === emptyIndex ? suggestedTag : tag)
      );
    } else {
      setTagList((prev) => [...prev, suggestedTag]);
    }

    setSuggestions((prev) => prev.filter((tag) => tag !== suggestedTag));
  };

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const onSubmit = () => {
      if (saveRef.current) {
        saveRef.current.disabled = true;
        saveRef.current.textContent = "saving...";
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
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

  useEffect(() => {
    setTagList(tags?.length ? tags : [""]);
  }, [tags]);

  useEffect(() => {
    const targetUrl = (url ?? "").trim();
    if (!targetUrl) {
      setSuggestions([]);
      setSuggestionError("");
      requestedForUrlRef.current = null;
      return;
    }

    if (requestedForUrlRef.current === targetUrl) {
      return;
    }

    requestedForUrlRef.current = targetUrl;
    const existingTags = uniqueTags(tags ?? []);
    loadSuggestions(targetUrl, existingTags);
  }, [url, title, tags]);

  return (
    <div class="flex flex-col gap-4 m-8 text-sm">
      <form
        ref={formRef}
        class="flex flex-col gap-2"
        method="post"
      >
        <div>
          <input
            ref={urlInputRef}
            type="text"
            name="url"
            defaultValue={url}
            placeholder="url"
            required
          />
        </div>

        <input
          type="hidden"
          name="title"
          value={title ?? ""}
        />
        <input
          type="hidden"
          name="deleteMark"
          value={deleteMark ? "true" : "false"}
        />

        <div className="flex flex-row gap-2">
          <div className="text-xs text-gray-500 ">suggested:</div>
          {loadingSuggestions && <div className="text-xs">loading...</div>}
          {suggestionError && (
            <div className="text-xs text-red-500">{suggestionError}</div>
          )}
          {!loadingSuggestions && !suggestionError && !suggestions.length && (
            <div className="text-xs text-gray-400">none</div>
          )}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-1 text-xs">
              {suggestions.map((suggestedTag) => (
                <a
                  key={suggestedTag}
                  href="#"
                  className="px-1 rounded hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    addSuggestedTag(suggestedTag);
                  }}
                >
                  {suggestedTag}
                </a>
              ))}
            </div>
          )}
        </div>

        <div class="flex flex-col gap-1" id="tags">
          {tagList.map((tag, i) => (
            <Tag
              key={i}
              value={tag}
              another={another}
              remove={() => removeTag(i)}
              update={(value) => updateTag(i, value)}
              formRef={formRef.current}
              inputRef={(el) => (inputRefs.current[i] = el)}
            />
          ))}
        </div>

        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="w-fit"
            onClick={another}
          >
            add another
          </button>
          <button
            type="button"
            className="w-fit disabled:opacity-50"
            disabled={loadingSuggestions}
            onClick={loadSuggestionsForCurrentUrl}
          >
            {loadingSuggestions ? "loading..." : "refresh suggestions"}
          </button>
        </div>

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
