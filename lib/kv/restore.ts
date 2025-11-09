export const restore = async (file: File): Promise<void> => {
  const kv = await Deno.openKv();

  const text = await file.text();
  const data: Record<string, unknown> = JSON.parse(text);

  //
  // Convert entries to [key, value] tuples
  const entries = Object.entries(data).map(([keyStr, value]) => [
    JSON.parse(keyStr),
    value,
  ]) as [Deno.KvKey, unknown][];

  //
  // Batch writes for better performance
  const BATCH_SIZE = 100;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(([key, value]) => kv.set(key, value)));
  }
};
