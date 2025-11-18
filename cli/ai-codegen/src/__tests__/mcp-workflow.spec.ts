/**
 * MCP Workflow Integration Test
 * Tests the complete workflow of MCP tool calls with metrics tracking
 */

import { describe, it, expect } from "vitest";
import { MCPMetricsTracker } from "../commands/mcp/mcp-metrics.js";

describe("MCP Metrics Tracking", () => {
  it("should track tool call success", () => {
    const tracker = new MCPMetricsTracker(false);

    const startTime = tracker.startToolCall("validate_ui_plan", { plan: {} });
    tracker.endToolCall("validate_ui_plan", startTime, true);

    const stats = tracker.getToolStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].name).toBe("validate_ui_plan");
    expect(stats[0].callCount).toBe(1);
    expect(stats[0].successCount).toBe(1);
    expect(stats[0].failureCount).toBe(0);
  });

  it("should track tool call failure", () => {
    const tracker = new MCPMetricsTracker(false);

    const startTime = tracker.startToolCall("generate_complete_module", { plan: {}, cwd: "." });
    tracker.endToolCall("generate_complete_module", startTime, false, "Validation failed");

    const stats = tracker.getToolStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].name).toBe("generate_complete_module");
    expect(stats[0].callCount).toBe(1);
    expect(stats[0].successCount).toBe(0);
    expect(stats[0].failureCount).toBe(1);
  });

  it("should track multiple tool calls", () => {
    const tracker = new MCPMetricsTracker(false);

    // Call 1: search_components
    let startTime = tracker.startToolCall("search_components", { query: "table" });
    tracker.endToolCall("search_components", startTime, true);

    // Call 2: view_components
    startTime = tracker.startToolCall("view_components", { components: ["VcTable"] });
    tracker.endToolCall("view_components", startTime, true);

    // Call 3: generate_complete_module
    startTime = tracker.startToolCall("generate_complete_module", { plan: {}, cwd: "." });
    tracker.endToolCall("generate_complete_module", startTime, true);

    const stats = tracker.getToolStats();
    expect(stats).toHaveLength(3);
    expect(tracker.getTotalCalls()).toBe(3);
  });

  it("should calculate average duration", () => {
    const tracker = new MCPMetricsTracker(false);

    const startTime1 = Date.now();
    tracker.endToolCall("test_tool", startTime1 - 100, true); // 100ms
    const startTime2 = Date.now();
    tracker.endToolCall("test_tool", startTime2 - 200, true); // 200ms

    const stats = tracker.getToolStats();
    expect(stats[0].avgDuration).toBeGreaterThan(0);
    expect(stats[0].totalDuration).toBeGreaterThan(0);
  });

  it("should track workflow sequence", () => {
    const tracker = new MCPMetricsTracker(false);

    // Simulate typical workflow
    const tools = ["search_components", "view_components", "validate_ui_plan", "generate_complete_module"];

    tools.forEach((tool) => {
      const startTime = tracker.startToolCall(tool, {});
      tracker.endToolCall(tool, startTime, true);
    });

    const workflow = tracker.getWorkflow();
    expect(workflow).toHaveLength(4);
    expect(workflow.map((s) => s.toolName)).toEqual(tools);
    expect(workflow.every((s) => s.success)).toBe(true);
  });

  it("should export JSON metrics", () => {
    const tracker = new MCPMetricsTracker(false);

    const startTime = tracker.startToolCall("validate_ui_plan", {});
    tracker.endToolCall("validate_ui_plan", startTime, true);

    const json = tracker.exportJSON();
    const data = JSON.parse(json);

    expect(data).toHaveProperty("sessionStart");
    expect(data).toHaveProperty("sessionDuration");
    expect(data).toHaveProperty("totalCalls", 1);
    expect(data).toHaveProperty("toolStats");
    expect(data).toHaveProperty("workflow");
    expect(data).toHaveProperty("allMetrics");
  });

  it("should handle empty metrics", () => {
    const tracker = new MCPMetricsTracker(false);

    expect(tracker.hasActivity()).toBe(false);
    expect(tracker.getTotalCalls()).toBe(0);
    expect(tracker.getToolStats()).toEqual([]);
  });
});

describe("MCP Workflow Scenarios", () => {
  it("should simulate simple module generation workflow", () => {
    const tracker = new MCPMetricsTracker(false);

    // Step 1: Search for table components
    let startTime = tracker.startToolCall("search_components", { query: "table" });
    tracker.endToolCall("search_components", startTime, true);

    // Step 2: View VcTable details
    startTime = tracker.startToolCall("view_components", { components: ["VcTable"] });
    tracker.endToolCall("view_components", startTime, true);

    // Step 3: Validate UI-Plan
    startTime = tracker.startToolCall("validate_ui_plan", { plan: {} });
    tracker.endToolCall("validate_ui_plan", startTime, true);

    // Step 4: Generate module
    startTime = tracker.startToolCall("generate_complete_module", { plan: {}, cwd: "." });
    tracker.endToolCall("generate_complete_module", startTime, true);

    const stats = tracker.getToolStats();
    const workflow = tracker.getWorkflow();

    expect(stats).toHaveLength(4);
    expect(workflow).toHaveLength(4);
    expect(workflow[0].toolName).toBe("search_components");
    expect(workflow[3].toolName).toBe("generate_complete_module");
    expect(workflow.every((s) => s.success)).toBe(true);
  });

  it("should simulate complex workflow with error", () => {
    const tracker = new MCPMetricsTracker(false);

    // Step 1: Validate (fails)
    let startTime = tracker.startToolCall("validate_ui_plan", { plan: {} });
    tracker.endToolCall("validate_ui_plan", startTime, false, "Invalid plan");

    // Step 2: Fix plan
    startTime = tracker.startToolCall("validate_and_fix_plan", { plan: {} });
    tracker.endToolCall("validate_and_fix_plan", startTime, true);

    // Step 3: Validate again (success)
    startTime = tracker.startToolCall("validate_ui_plan", { plan: {} });
    tracker.endToolCall("validate_ui_plan", startTime, true);

    // Step 4: Generate
    startTime = tracker.startToolCall("generate_complete_module", { plan: {}, cwd: "." });
    tracker.endToolCall("generate_complete_module", startTime, true);

    const stats = tracker.getToolStats();
    const validateStats = stats.find((s) => s.name === "validate_ui_plan");

    expect(validateStats).toBeDefined();
    expect(validateStats!.callCount).toBe(2);
    expect(validateStats!.successCount).toBe(1);
    expect(validateStats!.failureCount).toBe(1);
  });
});
