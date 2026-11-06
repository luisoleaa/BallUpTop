import { describe, expect, it } from "vitest";
import { toUser } from "./to-user";

describe("toUser", () => {
  it("returns null for no user", () => {
    expect(toUser(null)).toBeNull();
  });

  it("prefers user_metadata.name when present", () => {
    const user = toUser({ id: "u1", email: "a@b.com", user_metadata: { name: "Luis" } });
    expect(user).toEqual({ id: "u1", name: "Luis", email: "a@b.com" });
  });

  it("falls back to the email's local part when no name is set", () => {
    const user = toUser({ id: "u1", email: "luisolea@example.com" });
    expect(user?.name).toBe("luisolea");
  });

  it("falls back to a placeholder name when there's no email either", () => {
    const user = toUser({ id: "u1" });
    expect(user?.name).toBe("jordan");
    expect(user?.email).toBe("");
  });
});
