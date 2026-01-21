const OPENROUTER_ENV_KEYS = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_KEY",
  "NEXT_PUBLIC_OPENROUTER_API_KEY",
] as const;

export const OPENROUTER_KEY_HINT = OPENROUTER_ENV_KEYS[0];

export function getOpenRouterApiKey(): string | null {
  for (const key of OPENROUTER_ENV_KEYS) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}
