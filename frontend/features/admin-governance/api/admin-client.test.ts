import { beforeEach, describe, expect, test, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("admin-client contract normalization", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  test("fetchRoles normalizes numeric role ids from Java into strings", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([{ id: 2, name: "LECTURER", description: "Lecturer role" }]), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const { fetchRoles } = await import("@/features/admin-governance/api/admin-client");

    await expect(fetchRoles()).resolves.toEqual([
      {
        id: "2",
        name: "LECTURER",
        description: "Lecturer role",
      },
    ]);
  });

  test("fetchUsers normalizes nested numeric role ids from Java into strings", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "user-1",
            email: "lecturer@example.edu",
            fullName: "Lecturer Example",
            active: true,
            avatarUrl: null,
            createdAt: null,
            updatedAt: null,
            roleResponse: {
              id: 2,
              name: "LECTURER",
              description: "Lecturer role",
            },
          },
        ]),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const { fetchUsers } = await import("@/features/admin-governance/api/admin-client");

    await expect(fetchUsers()).resolves.toEqual([
      {
        id: "user-1",
        email: "lecturer@example.edu",
        fullName: "Lecturer Example",
        active: true,
        avatarUrl: null,
        createdAt: null,
        updatedAt: null,
        roleResponse: {
          id: "2",
          name: "LECTURER",
          description: "Lecturer role",
        },
      },
    ]);
  });
});
