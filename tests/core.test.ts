import { describe, it, expect } from "vitest";
import { Conciergeai } from "../src/core.js";
describe("Conciergeai", () => {
  it("init", () => { expect(new Conciergeai().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Conciergeai(); await c.generate(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Conciergeai(); await c.generate(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
