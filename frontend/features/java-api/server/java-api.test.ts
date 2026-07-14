import { describe, expect, test } from "vitest";

import { createJavaJsonResponse } from "@/features/java-api/server/java-api";

describe("createJavaJsonResponse", () => {
  test("serializes bigint values safely for Next.js responses", async () => {
    const response = createJavaJsonResponse({
      id: "document-1",
      fileSizeBytes: BigInt(123),
      nested: {
        chunkCount: BigInt(5),
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "document-1",
      fileSizeBytes: "123",
      nested: {
        chunkCount: "5",
      },
    });
  });

  test("converts undefined payloads to null for empty Java delete responses", async () => {
    const response = createJavaJsonResponse(undefined);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBeNull();
  });
});
