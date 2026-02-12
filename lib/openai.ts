import { OPENAI_API_KEY } from "@/lib/config.ts";

type SuggestBookmarkTagsInput = {
  url: string;
  title?: string;
  existingTags?: string[];
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const MAX_TAGS = 5;

const normalizeTag = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[`"'.,!?()[\]{}:_/\\|+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeTags = (values: string[]) => {
  const seen = new Set<string>();
  return values.reduce<string[]>((acc, value) => {
    const tag = normalizeTag(value);
    if (!tag || seen.has(tag)) {
      return acc;
    }

    seen.add(tag);
    acc.push(tag);
    return acc;
  }, []);
};

const buildPrompt = (
  { url, title, existingTags = [] }: SuggestBookmarkTagsInput,
) =>
  [
    url ? `URL: ${url}` : "",
    title ? `Title: ${title}` : "",
    existingTags.length ? `Existing tags: ${existingTags.join(", ")}` : "",
  ].filter(Boolean).join("\n");

const parseTags = (content: string): string[] => {
  try {
    const parsed = JSON.parse(content) as { tags?: unknown };
    if (Array.isArray(parsed.tags)) {
      return parsed.tags.filter(
        (t): t is string => typeof t === "string" && !!t.trim(),
      );
    }
  } catch {
    // ignore parse errors
  }
  return [];
};

export const suggestBookmarkTags = async (
  input: SuggestBookmarkTagsInput,
): Promise<string[]> => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const existingTags = normalizeTags(input.existingTags ?? []);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "Suggest useful tags for a bookmark.",
            'Return JSON: {"tags":["tag one","tag two"]}',
            "Rules: lowercase, spaces between words, no hyphens/underscores,",
            `max ${MAX_TAGS} tags, avoid broad tags like article/blog/link.`,
          ].join(" "),
        },
        {
          role: "user",
          content: buildPrompt({ ...input, existingTags }),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    }),
  });

  const payload = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        `OpenAI request failed with status ${response.status}`,
    );
  }

  const content = payload.choices?.[0]?.message?.content ?? "";
  const tags = normalizeTags(parseTags(content));

  return tags.filter((tag) => !existingTags.includes(tag)).slice(0, MAX_TAGS);
};
