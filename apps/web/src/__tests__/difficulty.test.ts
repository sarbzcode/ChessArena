import { describe, expect, it } from "vitest";
import { getMoveDelayMs, getSettings } from "../ai/difficulty";

describe("difficulty settings", () => {
  it("returns expected settings for each difficulty", () => {
    expect(getSettings("beginner")).toMatchObject({ skill: 4, depth: 8, movetime: 300 });
    expect(getSettings("intermediate")).toMatchObject({ skill: 10, depth: 12, movetime: 600 });
    expect(getSettings("expert")).toMatchObject({ skill: 18, depth: 16, movetime: 900 });
  });

  it("returns maxed expert settings for AIvsAI", () => {
    expect(getSettings("expert", false, "aivsai")).toMatchObject({
      skill: 20,
      depth: 24,
      movetime: 1500
    });
  });

  it("returns expected move delays", () => {
    expect(getMoveDelayMs("beginner")).toBe(250);
    expect(getMoveDelayMs("intermediate")).toBe(200);
    expect(getMoveDelayMs("expert")).toBe(150);
  });
});
