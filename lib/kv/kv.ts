export const kv = await Deno.openKv();

export const kvValues = async <T>(iter: Deno.KvListIterator<T>) =>
  await Array.fromAsync(iter, ({ value }) => value);

export const kvKeys = async <T>(iter: Deno.KvListIterator<T>) =>
  await Array.fromAsync(iter, ({ key }) => key);

export const kvAll = async <T>(iter: Deno.KvListIterator<T>) =>
  await Array.fromAsync(iter, ({ key, value }) => ({ key, value }));

export const dropAll = async () => {
  console.log("dropping all");
  const iter = kv.list({ prefix: [] });
  await Array.fromAsync(iter, ({ key }) => kv.delete(key));
  console.log("done");
};
