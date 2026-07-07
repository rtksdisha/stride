# Stride Key Code Snippets for Video Showcase

This document compiles the key code segments that demonstrate the **Agent Design**, **Google ADK integration**, and **Bidirectional State Syncing** mechanism. Use these snippets in your presentation slides or during voiceover explanations.

---

## 🐍 Snippet 1: Python ADK Agent Configuration (`agent.py`)
This snippet shows how the agent, the Gemini 2.5 Flash model, instructions, and tools are wired together using the Google Agent Development Kit.

```python
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from app.tools import (
    get_financial_profile,
    simulate_forecast,
    update_settings,
    add_house_milestone,
    # ... other milestone tools
)

SYSTEM_INSTRUCTION = """
You are Stride AI, an expert conversational personal finance planner...
Always call `simulate_forecast` immediately after making changes.
If a goal is requested, ask clarifying questions and append `[FORM: house]`, etc.
"""

root_agent = Agent(
    name="stride_agent",
    model=Gemini(
        model="gemini-2.5-flash",
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=SYSTEM_INSTRUCTION,
    tools=[
        get_financial_profile,
        simulate_forecast,
        update_settings,
        add_house_milestone,
        # ... other tools
    ],
)

app = App(root_agent=root_agent, name="app")
```

---

## 🛠️ Snippet 2: ADK Custom Tool & State Modification (`tools.py`)
This showcases how tools query and modify the current session state via `ToolContext` to evaluate simulations.

```python
from google.adk.tools import ToolContext

def simulate_forecast(tool_context: ToolContext) -> dict:
    """Simulates a 60-month cashflow projection based on the current session state.
    Returns whether the user stays positive ('On Track') or dips negative ('At Risk').
    """
    from app.finance import build_series, start_balance
    streams = tool_context.state.get("incomeStreams", [])
    spending = float(tool_context.state.get("spending", 3800.0))
    debts = tool_context.state.get("debts", [])
    goals = tool_context.state.get("goals", [])
    accounts = tool_context.state.get("accounts", [])
    
    start_bal = start_balance(accounts)
    series = build_series(streams, spending, debts, goals, ["committed", "active"], 61, start_bal)
    
    first_neg = next((idx for idx, val in enumerate(series) if val < 0), -1)
    lowest = min(series)
    
    return {
        "status": "On Track" if first_neg == -1 else "At Risk",
        "firstNegativeMonth": first_neg,
        "lowestBalance": lowest
    }
```

---

## ⚛️ Snippet 3: React Frontend Bidirectional State Syncing (`AiChat.tsx`)
This snippet shows how the frontend sends its current financial state and prompt, then applies the agent's modified state delta to trigger a visual layout redraw.

```typescript
const sendPrompt = async (textPrompt: string) => {
  const currentState = {
    incomeStreams: stride.incomeStreams,
    spending: stride.spending,
    accounts: stride.accounts,
    debts: stride.debts,
    goals: stride.goals,
    extraPayment: stride.extraPayment,
    strategy: stride.strategy,
  };

  const response = await fetch('http://localhost:8000/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appName: 'app',
      userId: 'user_anya',
      sessionId: sessionId,
      newMessage: { role: 'user', parts: [{ text: textPrompt }] },
      stateDelta: currentState, // Send full frontend state
    }),
  });

  const events = await response.json();
  
  if (Array.isArray(events)) {
    for (const ev of events) {
      // 1. Apply modified state delta to frontend reducer
      if (ev.actions && ev.actions.stateDelta) {
        stride.applyStateDelta(ev.actions.stateDelta);
      }
    }
  }
};
```

---

## ⚡ Snippet 4: Automated FastAPI Application Scaffold (`fast_api_app.py`)
This shows how the Google ADK library instantly turns the Python agent workspace into a production-grade FastAPI app.

```python
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app

AGENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Generated automatically by Google ADK CLI wrapper
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    artifact_service_uri=artifact_service_uri,
    allow_origins=allow_origins,
    session_service_uri=session_service_uri,
    otel_to_cloud=bool(project_id),
    auto_create_session=True,
)
```
