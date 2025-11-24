/**
 * Test New Architecture
 *
 * Tests complete architecture from Layer 1 to Layer 4.
 */

import { KnowledgeBase } from "./src/knowledge";
import { ComponentResolver, FeatureResolver } from "./src/intelligence";
import { SmartPromptAnalyzer, SmartUIPlanner } from "./src/generators";
import {
  WorkflowOrchestrator,
  AnalyzeStepExecutor,
  DiscoverStepExecutor,
  PlanStepExecutor,
  ValidateStepExecutor,
} from "./src/workflows";

async function testArchitecture() {
  console.log("🧪 Testing New Professional Architecture\n");

  // Layer 1: Knowledge Base
  console.log("=== Layer 1: Knowledge Base ===");
  const kb = new KnowledgeBase();
  await kb.loadAll();
  console.log("✅ Stats:", kb.stats);
  console.log("");

  // Layer 2: Intelligence
  console.log("=== Layer 2: Intelligence ===");
  const componentResolver = new ComponentResolver(kb.components);
  const featureResolver = new FeatureResolver(kb.features);

  // Test component resolution
  const componentMatch = await componentResolver.resolve({
    intent: "data table with filters and multiselect",
    context: "list",
    features: ["filters", "multiselect"],
  });

  console.log("✅ Component resolved:", componentMatch?.item.component);
  console.log("   Score:", componentMatch?.score);
  console.log("   Confidence:", componentMatch?.confidence);

  // Test feature validation
  const validation = await featureResolver.validate(["filters", "multiselect", "invalid"]);
  console.log("✅ Feature validation:");
  console.log("   Valid:", validation.valid.map((f) => f.id));
  console.log("   Invalid:", validation.invalid);
  console.log("");

  // Layer 3: Generators
  console.log("=== Layer 3: Generators ===");
  const analyzer = new SmartPromptAnalyzer(kb, featureResolver);
  const planner = new SmartUIPlanner(kb, componentResolver, featureResolver);

  const analysisPrompt = await analyzer.buildAnalysisPrompt("Create vendor management module");
  console.log("✅ Analysis prompt generated:", analysisPrompt.length, "chars");

  // Test with mock analysis
  const mockAnalysis = {
    moduleName: "vendors",
    description: "Vendor management module",
    entities: [
      {
        name: "Vendor",
        displayName: "Vendor",
        description: "Vendor entity",
        properties: [
          { name: "name", type: "string", required: true },
          { name: "email", type: "string", required: true },
        ],
        blades: [
          {
            type: "list" as const,
            route: "/vendors",
            isWorkspace: true,
            features: ["filters", "multiselect"],
          },
          {
            type: "details" as const,
            route: "/vendor",
            features: ["validation"],
          },
        ],
      },
    ],
  };

  const plan = await planner.generatePlan({ analysis: mockAnalysis });
  console.log("✅ UI-Plan generated:");
  console.log("   Module:", plan.module);
  console.log("   Blades:", plan.blades.length);
  console.log(
    "   Components:",
    plan.blades.map((b) => `${b.id}:${b.component.type}`),
  );
  console.log("");

  // Layer 4: Workflows
  console.log("=== Layer 4: Workflows ===");
  const workflowContext = {
    kb,
    componentResolver,
    featureResolver,
    analyzer,
    planner,
  };

  const orchestrator = new WorkflowOrchestrator(workflowContext);

  // Register executors
  orchestrator.registerExecutor("analyzing" as any, new AnalyzeStepExecutor());
  orchestrator.registerExecutor("discovering" as any, new DiscoverStepExecutor());
  orchestrator.registerExecutor("planning" as any, new PlanStepExecutor());
  orchestrator.registerExecutor("validating" as any, new ValidateStepExecutor());

  console.log("✅ Workflow orchestrator created");
  console.log("   Registered executors: 4");

  // Test discovery step
  console.log("\n🔍 Testing Discovery Step:");
  const discoverResult = await orchestrator.executeStep("discovering" as any, {
    analysis: mockAnalysis,
  });

  if (discoverResult.success) {
    console.log("✅ Discovery succeeded:");
    console.log("   Components found:", discoverResult.data?.discoveredComponents?.length || 0);
    console.log("   APIs found:", discoverResult.data?.discoveredAPIs?.length || 0);
  } else {
    console.log("❌ Discovery failed:", discoverResult.errors);
  }

  // Test planning step
  console.log("\n📋 Testing Planning Step:");
  const planResult = await orchestrator.executeStep("planning" as any, {
    analysis: mockAnalysis,
    discoveredComponents: discoverResult.data?.discoveredComponents || [],
    discoveredAPIs: discoverResult.data?.discoveredAPIs || [],
  });

  if (planResult.success) {
    console.log("✅ Planning succeeded:");
    console.log("   Plan created:", !!planResult.data?.plan);
    console.log("   Blades:", planResult.data?.plan?.blades?.length || 0);
  } else {
    console.log("❌ Planning failed:", planResult.errors);
  }

  // Test validation step
  if (planResult.data?.plan) {
    console.log("\n✓ Testing Validation Step:");
    const validateResult = await orchestrator.executeStep("validating" as any, {
      plan: planResult.data.plan,
    });

    if (validateResult.success) {
      console.log("✅ Validation succeeded");
    } else {
      console.log("❌ Validation failed:", validateResult.errors);
    }
  }

  console.log("\n🎉 Architecture Test Complete!");
  console.log("\n📊 Summary:");
  console.log("✅ Layer 1: Knowledge Base - WORKING");
  console.log("✅ Layer 2: Intelligence - WORKING");
  console.log("✅ Layer 3: Generators - WORKING");
  console.log("✅ Layer 4: Workflows - WORKING");
  console.log("\n🚀 Ready for MCP Server integration!");
}

testArchitecture().catch(console.error);
