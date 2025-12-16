# Virto OZ Assistant Implementation Plan

## Overview
AI chatbot assistant for VirtoCommerce Platform with DeepAgents orchestration and FastMCP tools.

## Key Documents
- **Plan**: `/Users/symbot/DEV/virto-oz-assistant/chatbot/PLAN.md`
- **Architecture**: `/Users/symbot/DEV/virto-oz-assistant/chatbot/architecture-refactor.md`

## Architecture Decisions

### Core Technologies
- **DeepAgents** - Agent orchestration with built-in planning (`write_todos`), subagents (`task`), file tools
- **FastMCP 2.0** - Single source of truth for tools (Python API + MCP protocol for external clients)
- **LangGraph** - State management with PostgresSaver checkpointing
- **FastAPI** - HTTP streaming API (`POST /api/chat`)

### Key Architectural Principles
1. **No VC Platform modifications** - Uses standard `/api/platform/modules` endpoint
2. **AI in module.manifest** - Modules declare AI capabilities in `<ai>` section
3. **FastMCP as single source** - Orchestrator calls tools through FastMCP.tools
4. **Dual interface by default** - HTTP streaming + MCP server run together
5. **Security-first** - Centralized RBAC, tool validation, per-tenant quotas

## Implementation Phases

### Phase 1: Foundation (MVP) - MOSTLY COMPLETE ✅
| Component | Status |
|-----------|--------|
| Tool Validator (JSON Schema + security lint) | ✅ Done |
| Tool Loader (YAML → LangChain) | ✅ Done |
| Tool Executor | ✅ Done |
| Agent Loader (Markdown → AgentDefinition) | ✅ Done |
| DeepAgents Orchestrator | ✅ Done |
| VC Platform Client | ✅ Done |
| Chat API with streaming | ✅ Done |
| Catalog tools (4 tools) | ✅ Done |

#### Pending Phase 1 Tasks
- [ ] **FastMCP Migration** - Re-route orchestrator through FastMCP
- [ ] **MCP Server with transports** - stdio/HTTP, run alongside FastAPI
- [ ] **Rename endpoint** to `/api/chat` (from `/api/chat/message`)
- [ ] **Session isolation** - `get_session_id()` = tenant+user+blade
- [ ] **Orchestrator caching** - Per tenant with invalidation
- [ ] **DeepAgents built-ins guardrails** - Scope write_todos/task/read_file/write_file

### Phase 2: Module AI Integration
- [ ] Define `<ai>` section schema for module.manifest
- [ ] Implement `discover_ai_capabilities()` in VCPlatformClient
- [ ] Implement `search_tools` meta-tool
- [ ] Subagent frontmatter loading (activation hints, tool patterns)
- [ ] Wire subagents to DeepAgents `task` tool
- [ ] Remove local YAML fallback once discovery is live

### Phase 3: Security & Multi-Tenancy
- [ ] TenantMiddleware (tenant/auth extraction)
- [ ] Auth context (authToken in ChatContext)
- [ ] RBAC enforcement via `/api/platform/security/userinfo`
- [ ] TenantConfig loader with env-var substitution
- [ ] QuotaManager with rate limiting (requests/min, hour, concurrent)
- [ ] TenantManager with lazy init + TTL refresh
- [ ] Cache invalidation hooks

### Phase 4: Frontend Integration
- [ ] RealChatApi with error handling (401, 403, 429)
- [ ] TenantId in ChatContext
- [ ] RateLimitBanner component
- [ ] PermissionDeniedMessage component
- [ ] Vite proxy configuration

### Phase 5: Production Readiness
- [ ] Prometheus metrics
- [ ] OpenTelemetry tracing
- [ ] PostgreSQL checkpointing (replace MemorySaver)
- [ ] Docker + CI/CD

## Stream Event Types (NDJSON)
```json
{"type": "thinking", "content": "..."}
{"type": "tool_call", "name": "...", "args": {...}}
{"type": "tool_result", "name": "...", "result": {...}}
{"type": "token", "content": "..."}
{"type": "error", "code": "...", "message": "..."}
{"type": "done", "message_id": "..."}
```

## Backend Structure
```
chatbot/backend/src/virto_oz/
├── main.py              # FastAPI + FastMCP entry point
├── api/
│   ├── chat.py          # POST /api/chat
│   └── health.py
├── mcp/
│   ├── server.py        # FastMCP server
│   └── transports.py    # stdio/HTTP handlers
├── tools/
│   ├── registry.py      # Tool registry + search_tools
│   ├── loader.py        # YAML → ToolDefinition
│   ├── executor.py      # Execute + RBAC
│   └── validator.py     # JSON Schema + security lint
├── agents/
│   ├── registry.py
│   ├── loader.py        # Markdown → AgentDefinition
│   └── factory.py
├── orchestrator/
│   ├── agent.py         # DeepAgents orchestrator
│   ├── subagents.py
│   ├── prompts.py
│   └── state.py         # ChatContext + get_session_id()
├── vc_platform/
│   ├── client.py        # API client + discover_ai_capabilities()
│   └── exceptions.py
├── tenants/
│   ├── manager.py       # TenantManager with TTL
│   ├── config.py        # Config loading with env-var substitution
│   ├── quotas.py        # QuotaManager
│   └── middleware.py    # Tenant identification
└── observability/
    └── logging.py       # structlog
```

## Key Patterns

### Session ID Generation
```python
def get_session_id(context: ChatContext) -> str:
    return f"{context.tenantId}_{context.userId}_{context.blade.id}"
```

### Orchestrator Caching
```python
_orchestrators: dict[str, VirtoOzOrchestrator] = {}

def get_orchestrator(tenant: TenantInstance) -> VirtoOzOrchestrator:
    if tenant.config.id not in _orchestrators:
        _orchestrators[tenant.config.id] = VirtoOzOrchestrator(tenant)
    return _orchestrators[tenant.config.id]

def invalidate_orchestrator(tenant_id: str):
    if tenant_id in _orchestrators:
        del _orchestrators[tenant_id]
```

### Tool Execution Path
```
DeepAgents Orchestrator
        │
        ▼
   FastMCP.tools (Python API)  ◄── Single source of truth
        │
        ▼
   ToolExecutor.execute() + RBAC check
        │
        ▼
   VC Platform REST API
```

## Tool Definition Schema
```yaml
name: catalog_search_products  # snake_case, ^[a-z][a-z0-9_]*$
description: |
  Search for products... (10-1000 chars)
parameters:
  type: object
  properties:
    query: { type: string }
  required: []
execution:
  endpoint: /api/catalog/search/products  # ^/api/[...]
  method: POST
  requestMapping:
    searchPhrase: "{{query}}"
  responseMapping:
    products: "$.results[*].{id: id, name: name}"
permission: catalog:read  # Required for POST/PUT/PATCH/DELETE
tags: [catalog, search, read]
```

## Success Criteria

### Phase 1 Complete When:
- Backend at `/api/chat` (renamed)
- FastMCP as single source of truth
- MCP server with stdio/HTTP transports
- Session isolation working
- Orchestrator caching per tenant

### Phase 2 Complete When:
- Tools discovered from `/api/platform/modules`
- `search_tools` meta-tool working
- Subagent frontmatter parsed
- Local YAML fallback removed

### Phase 3 Complete When:
- Multi-tenant isolation complete
- RBAC checks before every tool call
- Rate limiting with 429 + Retry-After
- Auth token propagated E2E

## References
- [DeepAgents](https://github.com/langchain-ai/deepagents)
- [FastMCP 2.0](https://gofastmcp.com/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
