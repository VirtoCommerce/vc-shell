/**
 * AI Code Generation Step Executor
 *
 * Takes enriched generation guides and sends them to AI for code generation.
 * AI generates final code based on:
 * - Base files from create-vc-app
 * - Discovered components/hooks from registry
 * - Templates, patterns, rules
 * - Detailed instructions
 *
 * This is where the actual AI code generation happens!
 */

import type { WorkflowState, WorkflowContext, StepExecutor, StepResult } from "../types";

/**
 * AI-generated code result
 */
export interface AIGeneratedCode {
  bladeId: string;
  blade: {
    path: string;
    content: string; // Full Vue SFC content
  };
  composable?: {
    path: string;
    content: string; // Full TypeScript content
  };
  apiClient?: {
    path: string;
    content: string; // Full API client content
  };
  locale?: {
    path: string;
    content: string; // JSON locale updates
  };
}

/**
 * AICodeGenStepExecutor
 *
 * Step 6: Send guides to AI and receive generated code.
 *
 * IMPORTANT: This step returns generation guides in the response.
 * The MCP tool handler will:
 * 1. Take these guides
 * 2. Send them to Claude/GPT via API
 * 3. Parse AI response to extract code
 * 4. Return generated code for validation
 */
export class AICodeGenStepExecutor implements StepExecutor {
  async execute(
    state: WorkflowState,
    context: WorkflowContext,
    input: { guides: any[] },
  ): Promise<StepResult> {
    const { guides } = input;

    try {
      console.log(`[AICodeGenStep] Processing ${guides.length} generation guides`);

      // In MCP context, we return the guides to be sent to AI
      // The MCP tool handler will actually call the AI API
      // and return the results back through the workflow

      const aiPrompts = guides.map((guide) => this.buildAIPrompt(guide));

      console.log(`[AICodeGenStep] ✅ Built ${aiPrompts.length} AI prompts`);
      console.log(`[AICodeGenStep] 📤 Ready for AI generation`);
      console.log(`[AICodeGenStep] → MCP tool will send these to Claude/GPT`);

      return {
        success: true,
        data: {
          generationGuides: guides,
          aiPrompts,
          // This signals to MCP tool that AI generation is needed
          requiresAI: true,
        },
        nextStep: "code-validation" as any,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [`AI code generation preparation failed: ${error.message}`],
      };
    }
  }

  canExecute(state: WorkflowState): boolean {
    return (
      !!state.generationGuides &&
      Array.isArray(state.generationGuides) &&
      state.generationGuides.length > 0
    );
  }

  getRequiredInput(): string[] {
    return ["guides"];
  }

  /**
   * Build complete AI prompt from generation guide
   */
  private buildAIPrompt(guide: any): {
    bladeId: string;
    systemPrompt: string;
    userPrompt: string;
    context: any;
  } {
    // System prompt - sets AI behavior
    const systemPrompt = this.buildSystemPrompt();

    // User prompt - specific task with full context
    const userPrompt = this.buildUserPrompt(guide);

    return {
      bladeId: guide.bladeId,
      systemPrompt,
      userPrompt,
      context: {
        module: guide.module,
        entity: guide.entity,
        bladeType: guide.bladeType,
        features: guide.features,
        baseFiles: guide.baseFiles,
      },
    };
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(): string {
    return `You are an expert VC-Shell developer.

Your task is to generate production-ready Vue 3 TypeScript code for VC-Shell applications.

REQUIREMENTS:
1. Use Vue 3 Composition API with <script setup lang="ts">
2. Use TypeScript with strict types
3. Use VC-Shell components and framework hooks ONLY from provided registry
4. Follow provided templates and patterns EXACTLY
5. Respect all rules and constraints
6. Generate complete, working code (no placeholders, no TODOs)
7. Add proper error handling
8. Match UI-Plan specifications exactly

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "blade": "<!-- complete .vue file content -->",
  "composable": "// complete .ts file content",
  "apiClient": "// complete API client .ts content (if needed)",
  "locale": { "key": "value" } // locale updates (if needed)
}

Do NOT include any explanations or markdown - ONLY the JSON object.`;
  }

  /**
   * Build user prompt with full context
   */
  private buildUserPrompt(guide: any): string {
    const sections: string[] = [];

    // Task
    sections.push("# TASK");
    sections.push(`Generate ${guide.bladeType} blade: ${guide.bladeId}`);
    sections.push(`Module: ${guide.module}`);
    sections.push(`Entity: ${guide.entity}`);
    sections.push(`Features: ${guide.features.join(", ")}`);
    sections.push("");

    // Base files
    sections.push("# BASE FILES (Already Created by create-vc-app)");
    sections.push("You will MODIFY these files according to requirements:");
    sections.push(`- Blade: ${guide.baseFiles.blade}`);
    sections.push(`- Composable: ${guide.baseFiles.composable}`);
    sections.push(`- Locale: ${guide.baseFiles.locale}`);
    sections.push("");

    // Components from registry
    if (guide.components?.length > 0) {
      sections.push("# VC-SHELL COMPONENTS (Use ONLY these)");
      guide.components.forEach((comp: any) => {
        sections.push(`\n## ${comp.name} (Confidence: ${(comp.confidence * 100).toFixed(0)}%)`);
        sections.push(`Description: ${comp.description}`);
        sections.push(`Match: ${comp.matchReason}`);

        if (comp.props) {
          sections.push("\n### Props:");
          sections.push("```typescript");
          sections.push(JSON.stringify(comp.props, null, 2));
          sections.push("```");
        }

        if (comp.slots?.length > 0) {
          sections.push("\n### Slots:");
          comp.slots.forEach((slot: any) => {
            sections.push(`- ${slot.name}: ${slot.description}`);
          });
        }

        if (comp.events?.length > 0) {
          sections.push("\n### Events:");
          comp.events.forEach((event: any) => {
            sections.push(`- ${event.name}: ${event.description}`);
          });
        }

        if (comp.examples?.length > 0) {
          sections.push("\n### Examples:");
          comp.examples.forEach((ex: string) => {
            sections.push("```vue");
            sections.push(ex);
            sections.push("```");
          });
        }
      });
      sections.push("");
    }

    // Framework hooks
    if (guide.hooks?.length > 0) {
      sections.push("# VC-SHELL FRAMEWORK HOOKS (Use ONLY these)");
      guide.hooks.forEach((hook: any) => {
        sections.push(`\n## ${hook.name}`);
        sections.push(`Import: import { ${hook.name} } from "${hook.import}";`);
        sections.push(`Description: ${hook.description}`);

        if (hook.methods?.length > 0) {
          sections.push("\n### Methods:");
          hook.methods.forEach((method: any) => {
            sections.push(`- ${method.name}(${method.params?.map((p: any) => `${p.name}: ${p.type}`).join(", ") || ""}): ${method.returns || "void"}`);
            sections.push(`  ${method.description}`);
          });
        }

        if (hook.examples?.length > 0) {
          sections.push("\n### Examples:");
          hook.examples.forEach((ex: string) => {
            sections.push("```typescript");
            sections.push(ex);
            sections.push("```");
          });
        }
      });
      sections.push("");
    }

    // Template
    if (guide.template) {
      sections.push("# TEMPLATE (Use as base structure)");
      sections.push(`Template: ${guide.template.id} (${guide.template.complexity})`);
      sections.push(`Description: ${guide.template.description}`);
      sections.push("\n```vue");
      sections.push(guide.template.content);
      sections.push("```");
      sections.push("");
    }

    // Patterns
    if (guide.patterns?.length > 0) {
      sections.push("# PATTERNS (Follow these patterns)");
      guide.patterns.forEach((pattern: any) => {
        sections.push(`\n## ${pattern.id}`);
        sections.push(pattern.description);
        sections.push(pattern.content);
      });
      sections.push("");
    }

    // Rules
    if (guide.rules?.length > 0) {
      sections.push("# RULES (Must follow)");
      guide.rules.forEach((rule: any) => {
        sections.push(`\n## ${rule.id}`);
        sections.push(rule.description);
        sections.push(rule.content);
      });
      sections.push("");
    }

    // Instructions
    sections.push("# INSTRUCTIONS");
    sections.push(guide.instructions);
    sections.push("");

    // Expected output
    sections.push("# EXPECTED OUTPUT");
    sections.push("Return JSON object with:");
    Object.entries(guide.expectedOutput).forEach(([key, desc]) => {
      if (desc) {
        sections.push(`- ${key}: ${desc}`);
      }
    });

    return sections.join("\n");
  }
}
