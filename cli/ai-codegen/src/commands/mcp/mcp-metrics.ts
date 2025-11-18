/**
 * MCP Metrics Tracker
 * Tracks usage statistics for MCP tools
 */

export interface ToolCallMetric {
  toolName: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  error?: string;
  args?: any;
}

export interface ToolStats {
  name: string;
  callCount: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  totalDuration: number;
  lastCalled?: number;
}

export interface WorkflowStep {
  toolName: string;
  timestamp: number;
  success: boolean;
}

export class MCPMetricsTracker {
  private metrics: ToolCallMetric[] = [];
  private sessionStart: number;
  private debugMode: boolean;

  constructor(debugMode = false) {
    this.sessionStart = Date.now();
    this.debugMode = debugMode;
  }

  /**
   * Record a tool call start
   */
  startToolCall(toolName: string, args?: any): number {
    const timestamp = Date.now();

    if (this.debugMode) {
      // Use stderr to avoid interfering with MCP stdio JSON-RPC protocol
      console.error(`\n[MCP TOOL CALL] ${toolName}`);
      if (args) {
        console.error(`[MCP ARGS] ${JSON.stringify(args, null, 2)}`);
      }
    }

    return timestamp;
  }

  /**
   * Record a tool call completion
   */
  endToolCall(toolName: string, startTime: number, success: boolean, error?: string): void {
    const duration = Date.now() - startTime;

    this.metrics.push({
      toolName,
      timestamp: startTime,
      duration,
      success,
      error,
    });

    if (this.debugMode) {
      if (success) {
        console.error(`[MCP SUCCESS] ${toolName} completed in ${duration}ms`);
      } else {
        console.error(`[MCP ERROR] ${toolName} failed after ${duration}ms: ${error}`);
      }
    }
  }

  /**
   * Get statistics for all tools
   */
  getToolStats(): ToolStats[] {
    const statsMap = new Map<string, ToolStats>();

    for (const metric of this.metrics) {
      if (!statsMap.has(metric.toolName)) {
        statsMap.set(metric.toolName, {
          name: metric.toolName,
          callCount: 0,
          successCount: 0,
          failureCount: 0,
          avgDuration: 0,
          totalDuration: 0,
        });
      }

      const stats = statsMap.get(metric.toolName)!;
      stats.callCount++;
      if (metric.success) {
        stats.successCount++;
      } else {
        stats.failureCount++;
      }
      if (metric.duration) {
        stats.totalDuration += metric.duration;
      }
      stats.lastCalled = metric.timestamp;
    }

    // Calculate averages
    for (const stats of statsMap.values()) {
      if (stats.callCount > 0) {
        stats.avgDuration = Math.round(stats.totalDuration / stats.callCount);
      }
    }

    return Array.from(statsMap.values()).sort((a, b) => b.callCount - a.callCount);
  }

  /**
   * Get workflow sequence
   */
  getWorkflow(): WorkflowStep[] {
    return this.metrics.map((m) => ({
      toolName: m.toolName,
      timestamp: m.timestamp,
      success: m.success,
    }));
  }

  /**
   * Print summary to console
   */
  printSummary(): void {
    const stats = this.getToolStats();
    const sessionDuration = Date.now() - this.sessionStart;
    const totalCalls = this.metrics.length;
    const successfulCalls = this.metrics.filter((m) => m.success).length;
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;

    // Use stderr for summary to avoid interfering with MCP stdio JSON-RPC protocol
    console.error("\n" + "=".repeat(60));
    console.error("MCP METRICS SUMMARY");
    console.error("=".repeat(60));
    console.error(`Session duration: ${Math.round(sessionDuration / 1000)}s`);
    console.error(`Total tool calls: ${totalCalls}`);
    console.error(`Success rate: ${successRate}%`);
    console.error("");

    if (stats.length === 0) {
      console.error("No tools were called during this session.");
      return;
    }

    console.error("Tool Usage Statistics:");
    console.error("-".repeat(60));
    console.error(
      `${"Tool Name".padEnd(30)} ${"Calls".padEnd(8)} ${"Success".padEnd(8)} ${"Avg (ms)".padEnd(10)}`,
    );
    console.error("-".repeat(60));

    for (const stat of stats) {
      const successRate = Math.round((stat.successCount / stat.callCount) * 100);
      console.error(
        `${stat.name.padEnd(30)} ${String(stat.callCount).padEnd(8)} ${String(successRate + "%").padEnd(8)} ${String(stat.avgDuration).padEnd(10)}`,
      );
    }

    console.error("=".repeat(60) + "\n");
  }

  /**
   * Export metrics to JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        sessionStart: this.sessionStart,
        sessionDuration: Date.now() - this.sessionStart,
        totalCalls: this.metrics.length,
        toolStats: this.getToolStats(),
        workflow: this.getWorkflow(),
        allMetrics: this.metrics,
      },
      null,
      2,
    );
  }

  /**
   * Get total call count
   */
  getTotalCalls(): number {
    return this.metrics.length;
  }

  /**
   * Check if any tools were called
   */
  hasActivity(): boolean {
    return this.metrics.length > 0;
  }
}
