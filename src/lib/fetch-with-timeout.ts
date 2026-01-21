const inflight = new Map<string, Promise<Response>>();

function buildDedupeKey(input: RequestInfo | URL, method: string) {
  const url = typeof input === "string" ? input : input.toString();
  return `${method.toUpperCase()} ${url}`;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: (RequestInit & { timeoutMs?: number; dedupe?: boolean }) | undefined = undefined
) {
  const { timeoutMs = 20000, dedupe = true, ...options } = init ?? {};
  const method = (options.method ?? "GET").toUpperCase();
  const shouldDedupe = dedupe && method === "GET";

  if (shouldDedupe) {
    const key = buildDedupeKey(input, method);
    const existing = inflight.get(key);
    if (existing) {
      const response = await existing;
      return response.clone();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const request = fetch(input, { ...options, signal: controller.signal })
      .finally(() => {
        clearTimeout(timeoutId);
        inflight.delete(key);
      });
    inflight.set(key, request);

    const response = await request;
    return response.clone();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
