import { expect, test, vi, beforeEach } from "vitest";
import { createMicPermission } from "../mediaPermissions";

beforeEach(() => {
  // happy-dom has no navigator.mediaDevices by default
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
});

test("initial state is 'unknown'", () => {
  const p = createMicPermission();
  expect(p.state.value).toBe("unknown");
});

test("request → granted updates state and resolves with the stream", async () => {
  const fakeStream = {} as MediaStream;
  (navigator.mediaDevices.getUserMedia as any).mockResolvedValue(fakeStream);
  const p = createMicPermission();
  const result = await p.request();
  expect(result).toBe(fakeStream);
  expect(p.state.value).toBe("granted");
});

test("request → denied sets denied state and rethrows", async () => {
  (navigator.mediaDevices.getUserMedia as any).mockRejectedValue(
    Object.assign(new Error("denied"), { name: "NotAllowedError" })
  );
  const p = createMicPermission();
  await expect(p.request()).rejects.toThrow();
  expect(p.state.value).toBe("denied");
});
