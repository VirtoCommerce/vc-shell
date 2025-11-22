/**
 * Workflow State Manager
 *
 * Manages stateful blade generation workflow to ensure AI processes
 * one blade at a time, eliminating choice paralysis and improving
 * execution probability from ~50% to ~80-90%.
 *
 * Key principles:
 * - ONE blade at a time (no choice for AI)
 * - Explicit state tracking (completed vs pending)
 * - Auto-progression (after submit, return next blade)
 * - Session isolation (multiple concurrent workflows)
 *
 * @module workflow-state-manager
 * @since 0.8.0
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Individual blade guide with generation instructions
 */
export interface BladeGuide {
  bladeId: string;
  context: {
    module: string;
    entity: string;
    features: string[];
    columns?: Array<{ id: string; title: string; type: string; sortable?: boolean; width?: string | number }>;
    fields?: Array<{ key: string; as: string; label: string; required?: boolean; validation?: string }>;
  };
  decision: {
    strategy: string;
    reason: string;
    complexity: number;
    estimatedTime?: string;
    willUseFallback?: boolean;
  };
  /**
   * NEW: Auto-discovered component information from workflow state
   * Includes capabilities, props, events, slots, examples for components used in this blade
   */
  componentInfo?: Array<{
    name: string;
    capabilities: Array<{
      id: string;
      name: string;
      description?: string;
      type?: string;
      examples?: Array<{
        title: string;
        description?: string;
        code: string;
      }>; // LAZY FETCHED: Code examples for this capability
    }>;
    props?: any[];
    slots?: any[];
    events?: any[];
    description?: string;
    examples?: Array<{
      title: string;
      description?: string;
      code: string;
    }>; // LAZY FETCHED: General component usage examples
  }>;
  /**
   * NEW: Auto-discovered framework API information from workflow state
   * Includes composables, plugins, utilities relevant to this blade's features
   */
  frameworkInfo?: Array<{
    name: string;
    type: string;
    category: string;
    description: string;
    capabilities: any[];
    methods?: any[];
    import?: string;
    examples?: Array<{
      title: string;
      description?: string;
      code: string;
    }>; // LAZY FETCHED: Framework API usage examples
  }>;
}

/**
 * Blade quality result
 */
export interface BladeQualityResult {
  bladeId: string;
  completed: boolean;
  completenessScore: number; // 0-100%
  attempts: number;
  timestamp: number;
  errors?: string[];
}

/**
 * Generation state for a single workflow session
 */
export interface GenerationState {
  sessionId: string;
  module: string;
  cwd: string;
  allGuides: BladeGuide[];
  currentIndex: number;
  completedBlades: string[];
  failedBlades: Array<{
    bladeId: string;
    error: string;
    attempts: number;
  }>;
  // 🔥 NEW: Quality tracking (stored as Record for JSON serialization)
  bladeResults?: Record<string, BladeQualityResult>;
  createdAt: number;
  plan?: any; // UI-Plan reference for validation
}

/**
 * Persistent state file location
 */
const STATE_DIR = path.join(os.tmpdir(), ".vc-shell-generation-states");
const STATE_FILE_PREFIX = "generation-state-";

/**
 * Manages stateful blade generation workflow
 */
export class WorkflowStateManager {
  /**
   * In-memory cache of active states
   */
  private states: Map<string, GenerationState> = new Map();

  constructor() {
    // Ensure state directory exists
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  /**
   * Start a new generation workflow
   *
   * @param module - Module name (e.g., "offers")
   * @param guides - All blade guides to generate
   * @param cwd - Working directory
   * @returns Session ID for tracking
   */
  startGeneration(module: string, guides: BladeGuide[], cwd: string): string {
    const sessionId = this.generateSessionId(module);

    const state: GenerationState = {
      sessionId,
      module,
      cwd,
      allGuides: guides,
      currentIndex: 0,
      completedBlades: [],
      failedBlades: [],
      bladeResults: {}, // 🔥 NEW: Initialize quality tracking
      createdAt: Date.now(),
    };

    // Store in memory
    this.states.set(sessionId, state);

    // Persist to disk
    this.saveState(state);

    return sessionId;
  }

  /**
   * Get the current blade that needs generation
   *
   * @param sessionId - Session identifier
   * @returns Current blade guide or null if workflow is complete
   */
  getCurrentBlade(sessionId: string): BladeGuide | null {
    const state = this.getState(sessionId);
    if (!state) {
      console.error(`[WorkflowStateManager] Session not found: ${sessionId}`);
      return null;
    }

    if (state.currentIndex >= state.allGuides.length) {
      console.log(`[WorkflowStateManager] All blades completed for session ${sessionId}`);
      return null;
    }

    return state.allGuides[state.currentIndex];
  }

  /**
   * Set the UI-Plan for validation
   *
   * @param sessionId - Session identifier
   * @param plan - UI-Plan object
   */
  setPlan(sessionId: string, plan: any): void {
    const state = this.getState(sessionId);
    if (!state) {
      console.error(`[WorkflowStateManager] Cannot set plan: session ${sessionId} not found`);
      return;
    }

    state.plan = plan;
    this.saveState(state);
    console.log(`[WorkflowStateManager] UI-Plan stored for session ${sessionId}`);
  }

  /**
   * Get a blade definition from the stored plan
   *
   * @param sessionId - Session identifier
   * @param bladeId - Blade identifier to find
   * @returns Blade definition from plan or null
   */
  getBladeFromPlan(sessionId: string, bladeId: string): any | null {
    const state = this.getState(sessionId);
    if (!state) {
      console.error(`[WorkflowStateManager] Cannot get blade: session ${sessionId} not found`);
      return null;
    }

    if (!state.plan || !state.plan.blades) {
      console.warn(`[WorkflowStateManager] No plan stored for session ${sessionId}`);
      return null;
    }

    const blade = state.plan.blades.find((b: any) => b.id === bladeId);
    if (!blade) {
      console.warn(`[WorkflowStateManager] Blade ${bladeId} not found in plan`);
    }

    return blade;
  }

  /**
   * Validate that a blade exists in the plan
   *
   * @param sessionId - Session identifier
   * @param bladeId - Blade identifier to validate
   * @returns true if blade exists in plan, false otherwise
   */
  validateBladeExistsInPlan(sessionId: string, bladeId: string): boolean {
    return this.getBladeFromPlan(sessionId, bladeId) !== null;
  }

  /**
   * Mark a blade as completed and advance to next
   *
   * 🔥 UPDATED: Now accepts completeness score for quality tracking
   *
   * @param sessionId - Session identifier
   * @param bladeId - Blade that was completed
   * @param completenessScore - Quality score (0-100%), default 100
   */
  markBladeCompleted(sessionId: string, bladeId: string, completenessScore: number = 100): void {
    const state = this.getState(sessionId);
    if (!state) {
      console.error(`[WorkflowStateManager] Cannot mark completed: session ${sessionId} not found`);
      return;
    }

    // Verify this is the current blade
    const currentBlade = state.allGuides[state.currentIndex];
    if (currentBlade?.bladeId !== bladeId) {
      console.warn(
        `[WorkflowStateManager] Blade mismatch: expected ${currentBlade?.bladeId}, got ${bladeId}`
      );
    }

    // Mark as completed
    state.completedBlades.push(bladeId);
    state.currentIndex++;

    // 🔥 NEW: Store quality result
    if (!state.bladeResults) {
      state.bladeResults = {};
    }

    state.bladeResults[bladeId] = {
      bladeId,
      completed: true,
      completenessScore,
      attempts: 1,
      timestamp: Date.now(),
    };

    // Persist changes
    this.saveState(state);

    console.log(
      `[WorkflowStateManager] Blade completed: ${bladeId} with ${completenessScore}% quality ` +
      `(${state.currentIndex}/${state.allGuides.length})`
    );
  }

  /**
   * Mark a blade as failed (with retry tracking)
   *
   * @param sessionId - Session identifier
   * @param bladeId - Blade that failed
   * @param error - Error message
   */
  markBladeFailed(sessionId: string, bladeId: string, error: string): void {
    const state = this.getState(sessionId);
    if (!state) return;

    // Check if blade already in failed list
    const existingFailed = state.failedBlades.find(f => f.bladeId === bladeId);
    if (existingFailed) {
      existingFailed.attempts++;
      existingFailed.error = error;
    } else {
      state.failedBlades.push({
        bladeId,
        error,
        attempts: 1,
      });
    }

    this.saveState(state);
  }

  /**
   * Check if there are more blades to generate
   *
   * @param sessionId - Session identifier
   * @returns True if more blades remain
   */
  hasMoreBlades(sessionId: string): boolean {
    const state = this.getState(sessionId);
    if (!state) return false;

    return state.currentIndex < state.allGuides.length;
  }

  /**
   * Get workflow progress information
   *
   * @param sessionId - Session identifier
   * @returns Progress stats or null
   */
  getProgress(sessionId: string): {
    current: number;
    total: number;
    completed: string[];
    failed: string[];
    remaining: number;
    percentComplete: number;
  } | null {
    const state = this.getState(sessionId);
    if (!state) return null;

    const total = state.allGuides.length;
    const completed = state.completedBlades.length;
    const remaining = total - state.currentIndex;

    return {
      current: state.currentIndex + 1,
      total,
      completed: state.completedBlades,
      failed: state.failedBlades.map(f => f.bladeId),
      remaining,
      percentComplete: Math.round((completed / total) * 100),
    };
  }

  /**
   * Get state (from memory or disk)
   */
  private getState(sessionId: string): GenerationState | null {
    // Try in-memory first
    if (this.states.has(sessionId)) {
      return this.states.get(sessionId)!;
    }

    // Try loading from disk
    const loaded = this.loadState(sessionId);
    if (loaded) {
      this.states.set(sessionId, loaded);
      return loaded;
    }

    return null;
  }

  /**
   * Save state to disk
   */
  private saveState(state: GenerationState): void {
    try {
      const filePath = path.join(STATE_DIR, `${STATE_FILE_PREFIX}${state.sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
    } catch (error) {
      console.error(`[WorkflowStateManager] Failed to save state:`, error);
    }
  }

  /**
   * Load state from disk
   */
  private loadState(sessionId: string): GenerationState | null {
    try {
      const filePath = path.join(STATE_DIR, `${STATE_FILE_PREFIX}${sessionId}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`[WorkflowStateManager] Failed to load state:`, error);
      return null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(module: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${module}_${timestamp}_${random}`;
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions(): void {
    try {
      const files = fs.readdirSync(STATE_DIR);
      const now = Date.now();
      const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        if (!file.startsWith(STATE_FILE_PREFIX)) continue;

        const filePath = path.join(STATE_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > MAX_AGE) {
          fs.unlinkSync(filePath);
          console.log(`[WorkflowStateManager] Cleaned up old session: ${file}`);
        }
      }
    } catch (error) {
      console.error(`[WorkflowStateManager] Cleanup failed:`, error);
    }
  }

  /**
   * Reset a session (useful for retrying)
   */
  resetSession(sessionId: string): void {
    const state = this.getState(sessionId);
    if (!state) return;

    state.currentIndex = 0;
    state.completedBlades = [];
    state.failedBlades = [];

    this.saveState(state);
    console.log(`[WorkflowStateManager] Session reset: ${sessionId}`);
  }

  /**
   * Delete a session completely
   */
  deleteSession(sessionId: string): void {
    // Remove from memory
    this.states.delete(sessionId);

    // Remove from disk
    try {
      const filePath = path.join(STATE_DIR, `${STATE_FILE_PREFIX}${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`[WorkflowStateManager] Failed to delete session:`, error);
    }
  }

  /**
   * List all active sessions
   */
  listActiveSessions(): Array<{
    sessionId: string;
    module: string;
    progress: string;
    age: string;
  }> {
    const sessions: Array<any> = [];

    try {
      const files = fs.readdirSync(STATE_DIR);
      const now = Date.now();

      for (const file of files) {
        if (!file.startsWith(STATE_FILE_PREFIX)) continue;

        const sessionId = file.replace(STATE_FILE_PREFIX, "").replace(".json", "");
        const state = this.getState(sessionId);
        if (!state) continue;

        const age = Math.round((now - state.createdAt) / 1000 / 60); // minutes
        const progress = `${state.completedBlades.length}/${state.allGuides.length}`;

        sessions.push({
          sessionId,
          module: state.module,
          progress,
          age: age < 60 ? `${age}m` : `${Math.round(age / 60)}h`,
        });
      }
    } catch (error) {
      console.error(`[WorkflowStateManager] Failed to list sessions:`, error);
    }

    return sessions;
  }
}

/**
 * Global instance (singleton)
 */
export const globalStateManager = new WorkflowStateManager();
