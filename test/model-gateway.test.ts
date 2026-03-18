/**
 * Unit tests for server/model/index.ts
 *
 * Tests the deterministic fallback (runDeterministicFallback / processAssistantCommand)
 * and the public processMessage gateway in "none" provider mode.
 * No external API calls are made — AI_PROVIDER defaults to "none".
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  processMessage,
  processAssistantCommand,
  type AssistantContext,
} from "../server/model/index.js";

// Base context used by most tests
const baseCtx: AssistantContext = {
  mode: "rental",
  moduleTypes: [],
};

// ── processAssistantCommand (deterministic fallback) ─────────────────────────

test("model-gateway: add fleet module command", () => {
  const result = processAssistantCommand("add fleet overview", baseCtx);
  assert.equal(result.moduleToAdd?.type, "fleet");
  assert.ok(result.response.length > 0);
  assert.equal(result.clearDashboard, false);
  assert.equal(result.switchMode, null);
  assert.deepEqual(result.memoryUpdate, { key: "last_added_module", value: "fleet" });
});

test("model-gateway: add bookings module command", () => {
  const result = processAssistantCommand("create a booking module", baseCtx);
  assert.equal(result.moduleToAdd?.type, "bookings");
  assert.ok(result.response.includes("Bookings"));
});

test("model-gateway: add tasks module command", () => {
  const result = processAssistantCommand("add task tracker", baseCtx);
  assert.equal(result.moduleToAdd?.type, "tasks");
});

test("model-gateway: add kpi module command", () => {
  const result = processAssistantCommand("add kpi widget", baseCtx);
  assert.equal(result.moduleToAdd?.type, "kpi");
  assert.ok(result.moduleToAdd?.data);
});

test("model-gateway: add notes module command", () => {
  const result = processAssistantCommand("add notes", baseCtx);
  assert.equal(result.moduleToAdd?.type, "notes");
});

test("model-gateway: clear dashboard command", () => {
  const result = processAssistantCommand("clear dashboard", baseCtx);
  assert.equal(result.clearDashboard, true);
  assert.equal(result.moduleToAdd, null);
  assert.ok(result.response.length > 0);
});

test("model-gateway: remove all command triggers clear", () => {
  const result = processAssistantCommand("remove all modules", baseCtx);
  assert.equal(result.clearDashboard, true);
});

test("model-gateway: switch to personal mode", () => {
  const result = processAssistantCommand("switch to personal mode", baseCtx);
  assert.equal(result.switchMode, "personal");
  assert.equal(result.moduleToAdd, null);
  assert.deepEqual(result.memoryUpdate, { key: "preferred_mode", value: "personal" });
});

test("model-gateway: switch to professional mode", () => {
  const result = processAssistantCommand("change to professional mode", baseCtx);
  assert.equal(result.switchMode, "professional");
});

test("model-gateway: switch to rental mode", () => {
  const result = processAssistantCommand("switch to rental mode", baseCtx);
  assert.equal(result.switchMode, "rental");
});

test("model-gateway: car keyword maps to rental mode", () => {
  const result = processAssistantCommand("switch to car mode", baseCtx);
  assert.equal(result.switchMode, "rental");
});

test("model-gateway: unknown command returns suggestions list", () => {
  const result = processAssistantCommand("hello there", baseCtx);
  assert.equal(result.moduleToAdd, null);
  assert.equal(result.clearDashboard, false);
  assert.equal(result.switchMode, null);
  assert.ok(result.response.includes("Add [module name]"));
  // actions array should contain suggestions relevant to rental mode
  assert.ok(Array.isArray(result.actions));
});

test("model-gateway: rental mode with no modules returns up to 4 suggestions", () => {
  const ctx: AssistantContext = {
    mode: "rental",
    moduleTypes: [],
  };
  const result = processAssistantCommand("what can you do", ctx);
  assert.ok(result.actions !== null);
  assert.ok((result.actions?.length ?? 0) <= 4);
});

test("model-gateway: missing modules are suggested, present ones are not", () => {
  const ctx: AssistantContext = {
    mode: "rental",
    moduleTypes: ["fleet", "bookings"],
  };
  const result = processAssistantCommand("help", ctx);
  // fleet and bookings are already present so they should NOT be suggested
  const suggestionsText = result.actions?.join(" ") ?? "";
  assert.ok(!suggestionsText.includes("Fleet Overview"));
  assert.ok(!suggestionsText.includes("Bookings"));
});

test("model-gateway: result always has all required fields", () => {
  const result = processAssistantCommand("add budget", baseCtx);
  assert.ok("response" in result);
  assert.ok("moduleToAdd" in result);
  assert.ok("clearDashboard" in result);
  assert.ok("switchMode" in result);
  assert.ok("actions" in result);
  assert.ok("memoryUpdate" in result);
  assert.equal(typeof result.response, "string");
  assert.equal(typeof result.clearDashboard, "boolean");
});

// ── processMessage (public async gateway in provider=none mode) ───────────────

test("model-gateway: processMessage with no provider acts like deterministic fallback", async () => {
  // Ensure provider is 'none' (default when AI_PROVIDER is not set)
  const prev = process.env.AI_PROVIDER;
  delete process.env.AI_PROVIDER;
  try {
    const result = await processMessage("add fleet", baseCtx);
    assert.equal(result.moduleToAdd?.type, "fleet");
  } finally {
    if (prev !== undefined) process.env.AI_PROVIDER = prev;
  }
});

test("model-gateway: processMessage openai provider without key falls back to deterministic", async () => {
  const prevProvider = process.env.AI_PROVIDER;
  const prevKey = process.env.OPENAI_API_KEY;
  process.env.AI_PROVIDER = "openai";
  delete process.env.OPENAI_API_KEY;
  try {
    // No key → condition fails → deterministic fallback
    const result = await processMessage("clear dashboard", baseCtx);
    assert.equal(result.clearDashboard, true);
  } finally {
    if (prevProvider !== undefined) process.env.AI_PROVIDER = prevProvider;
    else delete process.env.AI_PROVIDER;
    if (prevKey !== undefined) process.env.OPENAI_API_KEY = prevKey;
  }
});
