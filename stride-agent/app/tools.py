# Copyright 2026 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
import time
from google.adk.tools import ToolContext

def get_financial_profile(tool_context: ToolContext) -> dict:
    """Returns the user's current financial profile.
    
    Includes income streams, base monthly spending, starting account balances,
    debts, milestones (goals), extra monthly debt payments, and payoff strategy.
    Use this tool at the start of the conversation or when you need to inspect the current state.
    """
    return {
        "incomeStreams": tool_context.state.get("incomeStreams", []),
        "spending": float(tool_context.state.get("spending", 3800.0)),
        "accounts": tool_context.state.get("accounts", []),
        "debts": tool_context.state.get("debts", []),
        "goals": tool_context.state.get("goals", []),
        "extraPayment": float(tool_context.state.get("extraPayment", 0.0)),
        "strategy": tool_context.state.get("strategy", "avalanche"),
    }

def simulate_forecast(tool_context: ToolContext) -> dict:
    """Simulates a 60-month cashflow projection based on the current session state.
    
    It returns whether the user stays positive ('On Track') or dips negative ('At Risk'),
    including the first negative month index (0-60) and the lowest projected cash balance.
    Use this tool after modifying the state (adding/toggling milestones or settings) to evaluate feasibility.
    """
    from app.finance import build_series, start_balance
    streams = tool_context.state.get("incomeStreams", [])
    spending = float(tool_context.state.get("spending", 3800.0))
    debts = tool_context.state.get("debts", [])
    goals = tool_context.state.get("goals", [])
    accounts = tool_context.state.get("accounts", [])
    
    start_bal = start_balance(accounts)
    series = build_series(streams, spending, debts, goals, ["committed", "active"], 61, start_bal)
    
    first_neg = -1
    for idx, val in enumerate(series):
        if val < 0:
            first_neg = idx
            break
            
    lowest = min(series)
    return {
        "status": "On Track" if first_neg == -1 else "At Risk",
        "firstNegativeMonth": first_neg,
        "lowestBalance": lowest,
        "finalBalance": series[-1]
    }

def update_settings(
    spending: float = None,
    extra_payment: float = None,
    strategy: str = None,
    tool_context: ToolContext = None
) -> dict:
    """Updates the base monthly spending, extra monthly debt payment, and debt payoff strategy.
    
    Args:
        spending: Optional new base monthly spending amount.
        extra_payment: Optional new extra monthly debt payment amount.
        strategy: Optional debt payoff strategy ('avalanche' or 'snowball').
    """
    if spending is not None:
        tool_context.state["spending"] = spending
    if extra_payment is not None:
        tool_context.state["extraPayment"] = extra_payment
    if strategy is not None:
        if strategy not in ["avalanche", "snowball"]:
            return {"status": "error", "message": "Strategy must be 'avalanche' or 'snowball'."}
        tool_context.state["strategy"] = strategy
    return {"status": "success", "message": "Settings updated successfully."}

def add_simple_milestone(
    name: str,
    amount: float,
    month: int,
    tool_context: ToolContext = None
) -> dict:
    """Adds a simple savings target milestone to the profile.
    
    Args:
        name: Descriptive name of the milestone (e.g. 'Wedding', 'Emergency Fund').
        amount: Target saving amount.
        month: Month index (1-60) from today when the target date is set.
    """
    goals = tool_context.state.get("goals", [])
    key = f"g_simple_{int(time.time())}"
    new_goal = {
        "key": key,
        "name": name,
        "amount": amount,
        "month": month,
        "saved": 0,
        "ratio": 0.5,
        "status": "active",
        "glyph": "🎯",
        "tint": "rgba(138,111,176,0.14)",
        "dot": "#8A6FB0"
    }
    goals.append(new_goal)
    tool_context.state["goals"] = goals
    return {"status": "success", "message": f"Added simple savings milestone '{name}' for ${amount} at month {month}."}

def add_car_milestone(
    name: str,
    price: float,
    down_payment: float,
    month: int,
    trade_in: float = 0.0,
    apr: float = 7.0,
    term_months: int = 60,
    insurance: float = 150.0,
    gas: float = 200.0,
    tool_context: ToolContext = None
) -> dict:
    """Adds a template-based vehicle milestone.
    
    Args:
        name: Name of the milestone (e.g., 'Tesla Model Y', 'Used Civic').
        price: Total purchase price of the vehicle.
        down_payment: Cash down payment.
        month: Purchase month index (1-60) from today.
        trade_in: Trade-in credit or value of old vehicle.
        apr: Loan APR percentage (e.g., 6.5).
        term_months: Loan payoff term in months (e.g., 60).
        insurance: Estimated monthly insurance cost.
        gas: Estimated monthly gas & maintenance costs.
    """
    goals = tool_context.state.get("goals", [])
    key = f"g_car_{int(time.time())}"
    new_goal = {
        "key": key,
        "kind": "template",
        "template": "buy_car",
        "name": name,
        "glyph": "🚗",
        "tint": "rgba(92,123,138,0.14)",
        "dot": "#5C7B8A",
        "status": "active",
        "params": {
            "month": month,
            "price": price,
            "down": down_payment,
            "tradeIn": trade_in,
            "apr": apr,
            "term": term_months,
            "insurance": insurance,
            "gas": gas
        }
    }
    goals.append(new_goal)
    tool_context.state["goals"] = goals
    return {"status": "success", "message": f"Added car milestone '{name}' at month {month}."}

def add_house_milestone(
    name: str,
    price: float,
    down_payment: float,
    month: int,
    apr: float = 6.5,
    amort_years: int = 30,
    closing_pct: float = 2.0,
    tax_pct: float = 1.2,
    insurance: float = 150.0,
    maint_pct: float = 1.0,
    hoa: float = 0.0,
    tool_context: ToolContext = None
) -> dict:
    """Adds a template-based house milestone.
    
    Args:
        name: Name of the milestone (e.g. 'First Home').
        price: Total purchase price.
        down_payment: Mortgage down payment.
        month: Closing month index (1-60) from today.
        apr: Mortgage APR percentage (e.g. 5.5).
        amort_years: Amortization term in years (e.g. 30).
        closing_pct: Closing costs percentage (e.g. 2.0).
        tax_pct: Property tax percentage per year (e.g. 1.2).
        insurance: Estimated monthly home insurance.
        maint_pct: Maintenance percentage per year (e.g. 1.0).
        hoa: Estimated monthly HOA fees.
    """
    goals = tool_context.state.get("goals", [])
    key = f"g_house_{int(time.time())}"
    new_goal = {
        "key": key,
        "kind": "template",
        "template": "buy_house",
        "name": name,
        "glyph": "🏠",
        "tint": "rgba(47,125,91,0.13)",
        "dot": "#2F7D5B",
        "status": "active",
        "params": {
            "month": month,
            "price": price,
            "down": down_payment,
            "apr": apr,
            "amortYears": amort_years,
            "closingPct": closing_pct,
            "taxPct": tax_pct,
            "insurance": insurance,
            "maintPct": maint_pct,
            "hoa": hoa
        }
    }
    goals.append(new_goal)
    tool_context.state["goals"] = goals
    return {"status": "success", "message": f"Added house milestone '{name}' at month {month}."}

def add_sabbatical_milestone(
    name: str,
    duration_months: int,
    month: int,
    pause_income_key: str = "",
    monthly_spend: float = 2000.0,
    healthcare: float = 200.0,
    tool_context: ToolContext = None
) -> dict:
    """Adds a template-based sabbatical milestone (career break).
    
    Args:
        name: Name of the milestone (e.g., 'Europe Trip').
        duration_months: Duration of the sabbatical in months (e.g., 6).
        month: Start month index (1-60) from today.
        pause_income_key: Key of the income stream to pause (e.g., 'i1'). Leave empty if none.
        monthly_spend: Additional lifestyle spend per month during sabbatical.
        healthcare: Additional monthly healthcare spend during sabbatical.
    """
    goals = tool_context.state.get("goals", [])
    key = f"g_sab_{int(time.time())}"
    new_goal = {
        "key": key,
        "kind": "template",
        "template": "sabbatical",
        "name": name,
        "glyph": "🌿",
        "tint": "rgba(192,121,46,0.14)",
        "dot": "#C0792E",
        "status": "active",
        "params": {
            "month": month,
            "duration": duration_months,
            "pauseKey": pause_income_key if pause_income_key != "" else "none",
            "travel": monthly_spend,
            "healthcare": healthcare
        }
    }
    goals.append(new_goal)
    tool_context.state["goals"] = goals
    return {"status": "success", "message": f"Added sabbatical milestone '{name}' for {duration_months} months starting at month {month}."}

def remove_milestone(name_or_key: str, tool_context: ToolContext = None) -> dict:
    """Removes a milestone (goal) by its exact key or matching name.
    
    Args:
        name_or_key: The unique key (e.g., 'g_car_123') or the name of the milestone (e.g., 'Europe Trip').
    """
    goals = tool_context.state.get("goals", [])
    filtered_goals = [g for g in goals if g.get("key") != name_or_key and g.get("name", "").lower() != name_or_key.lower()]
    if len(filtered_goals) == len(goals):
        return {"status": "error", "message": f"Milestone matching '{name_or_key}' not found."}
    
    tool_context.state["goals"] = filtered_goals
    return {"status": "success", "message": f"Removed milestone matching '{name_or_key}'."}

def add_income_stream(
    tool_context: ToolContext,
    name: str,
    amount: float,
    frequency: str = "Monthly",
    start: int = 0,
    duration: int | None = None,
    glyph: str = "💼"
) -> dict:
    """Adds a new income stream to the user's financial profile.
    
    Args:
        name: Name of the income source (e.g. 'Job Promotion' or 'Freelance Work')
        amount: The take-home cash amount (e.g. 5000.0)
        frequency: How often it is received. Must be 'Monthly', 'Annual', or 'One-time'. Defaults to 'Monthly'.
        start: Starting month offset from today (0-indexed). Defaults to 0.
        duration: Duration of the stream in months. Set to None (null) for ongoing.
        glyph: Emoji representation of the income. Defaults to '💼'.
    """
    if frequency not in ["Monthly", "Annual", "One-time"]:
        frequency = "Monthly"
        
    streams = list(tool_context.state.get("incomeStreams", []))
    key = f"i{int(time.time() * 1000)}"
    
    PALETTE = ["#629E85", "#708D81", "#8C9D86", "#9CB198", "#B5C6B1"]
    dot = PALETTE[len(streams) % len(PALETTE)]
    
    new_stream = {
        "key": key,
        "name": name,
        "glyph": glyph,
        "amount": float(amount),
        "frequency": frequency,
        "start": int(start),
        "duration": duration if duration is None else int(duration),
        "active": True,
        "dot": dot,
    }
    
    streams.append(new_stream)
    tool_context.state["incomeStreams"] = streams
    return {"status": "Success", "addedStream": new_stream}

def remove_income_stream(tool_context: ToolContext, key: str) -> dict:
    """Removes an income stream from the user's profile by its key.
    
    Args:
        key: The unique string key of the income stream to remove (e.g. 'i178296...')
    """
    streams = tool_context.state.get("incomeStreams", [])
    filtered = [x for x in streams if x.get("key") != key]
    if len(filtered) == len(streams):
        return {"status": "Error", "message": f"Income stream with key '{key}' not found."}
    tool_context.state["incomeStreams"] = filtered
    return {"status": "Success", "message": f"Income stream '{key}' removed."}

