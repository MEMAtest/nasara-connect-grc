export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: (RequestInit & { timeoutMs?: number }) | undefined = undefined
) {
  const { timeoutMs = 20000, ...options } = init ?? {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
