export async function safeFetch(
  input: RequestInfo,
  init: RequestInit = {},
  timeout = 8000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    return res;
  } finally {
    clearTimeout(id);
  }
}
