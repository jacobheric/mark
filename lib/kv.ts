export const kv = await Deno.openKv();

export const kvValues = async <T>(iter: Deno.KvListIterator<T>) =>
  await Array.fromAsync(iter, ({ value }) => value);
