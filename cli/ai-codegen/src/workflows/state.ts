/**
 * WorkflowStateManager
 *
 * Professional state management for workflows.
 * Tracks current step, data, and transitions.
 */

import type { WorkflowState, WorkflowStep } from "./types";

/**
 * WorkflowStateManager
 *
 * Manages workflow state transitions and data.
 */
export class WorkflowStateManager {
  private state: WorkflowState;
  private history: WorkflowState[] = [];

  constructor(initialStep: WorkflowStep = "initial" as any) {
    this.state = {
      currentStep: initialStep,
    };
  }

  /**
   * Get current state (immutable)
   */
  getState(): Readonly<WorkflowState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get current step
   */
  getCurrentStep(): WorkflowStep {
    return this.state.currentStep;
  }

  /**
   * Update state with partial data
   */
  updateState(updates: Partial<WorkflowState>): void {
    this.saveToHistory();
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  /**
   * Transition to next step
   */
  transitionTo(nextStep: WorkflowStep, data?: Partial<WorkflowState>): void {
    this.saveToHistory();
    this.state = {
      ...this.state,
      currentStep: nextStep,
      ...data,
    };
  }

  /**
   * Add error
   */
  addError(error: string): void {
    this.state.errors = [...(this.state.errors || []), error];
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.state.errors = [];
  }

  /**
   * Check if workflow is in terminal state
   */
  isTerminal(): boolean {
    return (
      this.state.currentStep === ("completed" as any) ||
      this.state.currentStep === ("failed" as any)
    );
  }

  /**
   * Check if workflow can execute step
   */
  canExecuteStep(step: WorkflowStep): boolean {
    const stepOrder: WorkflowStep[] = [
      "initial" as any,
      "analyzing" as any,
      "discovering" as any,
      "planning" as any,
      "validating" as any,
      "generating" as any,
      "ai-codegen" as any,
      "code-validation" as any,
      "submitting" as any,
      "completed" as any,
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    const targetIndex = stepOrder.indexOf(step);

    // Can execute if target is next step or current step (re-execute)
    // Also allow ai-codegen -> code-validation and code-validation -> submitting
    return targetIndex <= currentIndex + 1;
  }

  /**
   * Reset workflow to initial state
   */
  reset(): void {
    this.history = [];
    this.state = {
      currentStep: "initial" as any,
    };
  }

  /**
   * Get workflow history
   */
  getHistory(): ReadonlyArray<Readonly<WorkflowState>> {
    return this.history.map((s) => Object.freeze({ ...s }));
  }

  /**
   * Save current state to history
   */
  private saveToHistory(): void {
    this.history.push({ ...this.state });
  }

  /**
   * Get workflow progress (0-100)
   */
  getProgress(): number {
    const stepProgress: Record<string, number> = {
      initial: 0,
      analyzing: 15,
      discovering: 30,
      planning: 50,
      validating: 65,
      generating: 80,
      submitting: 95,
      completed: 100,
      failed: 0,
    };

    return stepProgress[this.state.currentStep] || 0;
  }

  /**
   * Get readable status
   */
  getStatus(): {
    step: string;
    progress: number;
    isComplete: boolean;
    isFailed: boolean;
    errors: string[];
  } {
    return {
      step: this.state.currentStep,
      progress: this.getProgress(),
      isComplete: this.state.currentStep === ("completed" as any),
      isFailed: this.state.currentStep === ("failed" as any),
      errors: this.state.errors || [],
    };
  }
}
