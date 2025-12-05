import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

const originalFetch = global.fetch;
const originalEnvKey = process.env.OPENROUTER_API_KEY;

describe("AI chat route", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalEnvKey;
    vi.restoreAllMocks();
  });

  it("returns assistant message when upstream succeeds", async () => {
    const mockResponse = {
      choices: [{ message: { role: "assistant", content: "Hello from model" } }],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }], stream: false }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(body.message.content).toContain("Hello from model");
    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it("returns error when upstream fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue("Upstream failure"),
      status: 500,
    } as unknown as Response);

    const req = new Request("http://localhost/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }], stream: false }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
