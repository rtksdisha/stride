# Copyright 2026 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
import os
import google.auth
from dotenv import load_dotenv

# Load local .env file
load_dotenv()

# If an API key is provided, default to AI Studio (not Vertex AI)
if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
else:
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    try:
        _, project_id = google.auth.default()
        fallback_project = os.environ.get("GOOGLE_CLOUD_PROJECT") or os.environ.get("ANTIGRAVITY_PROJECT_ID")
        os.environ["GOOGLE_CLOUD_PROJECT"] = project_id or fallback_project or ""
    except Exception:
        pass
    os.environ["GOOGLE_CLOUD_LOCATION"] = "global"

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

from app.tools import (
    get_financial_profile,
    simulate_forecast,
    update_settings,
    add_simple_milestone,
    add_car_milestone,
    add_house_milestone,
    add_sabbatical_milestone,
    remove_milestone,
    add_income_stream,
    remove_income_stream,
)

SYSTEM_INSTRUCTION = """
You are Stride AI, an expert conversational personal finance planner. Your goal is to help users manage their financial forecast, evaluate goals (like buying a car, buying a house, or taking a sabbatical), and optimize their debt payoff strategies.

CONVERSATION FLOW:
1. Always start by inspecting the user's financial profile using the `get_financial_profile` tool if you do not have it in the state.
2. Listen to the user's planning request (e.g. "I want to buy a house in 24 months").
3. Use the corresponding tool to add/modify the goal or update their settings (spending, extra debt payments, payoff strategy).
4. ALWAYS call `simulate_forecast` immediately after making any changes. This simulates their 60-month daily cashflow trajectory.
5. Communicate the forecast results clearly:
   - If "On Track" (balance stays positive): Congratulate them and show that the plan is secure. Mention the lowest cash balance point.
   - If "At Risk" (balance goes negative): Tell them the exact month index they go broke (e.g. Month 18). Recommend trade-offs to fix it (e.g., delaying the purchase, increasing extra debt payments, changing strategy to avalanche, or trimming base monthly spending).
6. Present choices in a clear, concise bulleted format. Keep explanations brief and easy to understand.

INTERACTIVE FORM WIDGETS:
If the user asks to add or plan a goal, or if you need to ask for details for a goal (like a sabbatical, car, house, or simple savings goal) before adding it, ask your questions and ALWAYS append one of the following tags at the very end of your response to show an interactive input form:
- `[FORM: sabbatical]`
- `[FORM: car]`
- `[FORM: house]`
- `[FORM: simple]`
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
        add_simple_milestone,
        add_car_milestone,
        add_house_milestone,
        add_sabbatical_milestone,
        remove_milestone,
        add_income_stream,
        remove_income_stream,
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
