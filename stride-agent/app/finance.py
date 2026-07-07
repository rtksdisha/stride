# Copyright 2026 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
import math

PER_MONTH = {
    'Weekly': 52 / 12,
    'Biweekly': 26 / 12,
    'Semi-monthly': 2.0,
    'Monthly': 1.0,
    'Quarterly': 1 / 3,
    'Annual': 1 / 12,
    'One-time': 0.0,
}

def amort(principal: float, apr_pct: float, months: int) -> float:
    principal = max(0.0, principal)
    months = max(0, int(round(months)))
    if months <= 0:
        return 0.0
    r = apr_pct / 100.0 / 12.0
    if r == 0:
        return principal / months
    try:
        return (principal * r) / (1.0 - math.pow(1.0 + r, -months))
    except (ZeroDivisionError, OverflowError):
        return principal / months

def monthly_equiv(frequency: str, amount: float) -> float:
    return amount * PER_MONTH.get(frequency, 1.0)

def income_at(month_idx: int, streams: list) -> float:
    total = 0.0
    for s in streams:
        if not s.get('active', True):
            continue
        start = int(round(s.get('start', 0)))
        duration = s.get('duration')
        
        # check if active in this month
        if duration is None:
            within = month_idx >= start
        else:
            within = start <= month_idx < start + int(round(duration))
            
        if not within:
            continue
            
        freq = s.get('frequency', 'Monthly')
        amt = float(s.get('amount', 0.0))
        if freq == 'One-time':
            if month_idx == start:
                total += amt
        else:
            total += monthly_equiv(freq, amt)
    return total

def debt_outflow(debts: list) -> float:
    total = 0.0
    for d in debts:
        if not d.get('active', True):
            continue
        total += float(d.get('minPayment', 0.0))
    return total

def milestone_events(g: dict, streams: list, horizon: int) -> dict:
    one_times = []
    recurrings = []
    
    kind = g.get('kind')
    if kind != 'template':
        # Simple Goal
        one_times.append({'m': int(round(g.get('month', 0))), 'amt': float(g.get('amount', 0.0))})
        return {'one_times': one_times, 'recurrings': recurrings}
        
    # Template Goal
    template = g.get('template')
    params = g.get('params', {})
    m = int(round(params.get('month', 0)))
    
    if template == 'buy_car':
        price = float(params.get('price', 0.0))
        down = float(params.get('down', 0.0))
        trade_in = float(params.get('tradeIn', 0.0))
        apr = float(params.get('apr', 0.0))
        term = int(params.get('term', 1))
        insurance = float(params.get('insurance', 0.0))
        gas = float(params.get('gas', 0.0))
        
        principal = max(0.0, price - down - trade_in)
        pay = amort(principal, apr, term)
        
        one_times.append({'m': m, 'amt': down})
        if trade_in > 0:
            one_times.append({'m': m, 'amt': -trade_in})
            
        recurrings.append({'from': m + 1, 'to': m + 1 + term, 'amt': pay})
        recurrings.append({'from': m, 'to': horizon, 'amt': insurance})
        recurrings.append({'from': m, 'to': horizon, 'amt': gas})
        
    elif template == 'buy_house':
        price = float(params.get('price', 0.0))
        down = float(params.get('down', 0.0))
        apr = float(params.get('apr', 0.0))
        amort_years = int(params.get('amortYears', 30))
        closing_pct = float(params.get('closingPct', 0.0))
        tax_pct = float(params.get('taxPct', 0.0))
        insurance = float(params.get('insurance', 0.0))
        maint_pct = float(params.get('maintPct', 0.0))
        hoa = float(params.get('hoa', 0.0))
        
        months = amort_years * 12
        principal = max(0.0, price - down)
        pay = amort(principal, apr, months)
        
        one_times.append({'m': m, 'amt': down})
        one_times.append({'m': m, 'amt': (price * closing_pct) / 100.0})
        
        recurrings.append({'from': m + 1, 'to': m + 1 + months, 'amt': pay})
        recurrings.append({'from': m, 'to': horizon, 'amt': (price * tax_pct) / 100.0 / 12.0})
        recurrings.append({'from': m, 'to': horizon, 'amt': insurance})
        recurrings.append({'from': m, 'to': horizon, 'amt': (price * maint_pct) / 100.0 / 12.0})
        if hoa > 0:
            recurrings.append({'from': m, 'to': horizon, 'amt': hoa})
            
    elif template == 'sabbatical':
        duration = int(params.get('duration', 6))
        pause_key = params.get('pauseKey')
        travel = float(params.get('travel', 0.0))
        healthcare = float(params.get('healthcare', 0.0))
        
        # Find stream to pause
        paused = 0.0
        if pause_key:
            for s in streams:
                if s.get('key') == pause_key:
                    paused = monthly_equiv(s.get('frequency', 'Monthly'), float(s.get('amount', 0.0)))
                    break
        
        recurrings.append({'from': m, 'to': m + duration, 'amt': paused})
        recurrings.append({'from': m, 'to': m + duration, 'amt': travel})
        recurrings.append({'from': m, 'to': m + duration, 'amt': healthcare})
        
    elif template == 'wedding':
        price = float(params.get('price', 0.0))
        contribution = float(params.get('contribution', 0.0))
        one_times.append({'m': m, 'amt': price})
        if contribution > 0:
            one_times.append({'m': m, 'amt': -contribution})
            
    elif template == 'savings_goal':
        monthly_contrib = float(params.get('monthlyContribution', 0.0))
        initial_dep = float(params.get('initialDeposit', 0.0))
        if monthly_contrib > 0:
            recurrings.append({'from': 0, 'to': m, 'amt': -monthly_contrib})
        if initial_dep > 0:
            one_times.append({'m': 0, 'amt': -initial_dep})
            
    elif template == 'custom':
        prims = params.get('prims', [])
        for pr in prims:
            kind = pr.get('kind')
            pm = int(round(pr.get('month', 0)))
            if kind == 'once':
                one_times.append({'m': pm, 'amt': float(pr.get('amt', 0.0))})
            elif kind == 'recur':
                recurrings.append({'from': pm, 'to': pm + int(round(pr.get('months', 1))), 'amt': float(pr.get('amt', 0.0))})
            elif kind == 'loan':
                principal = float(pr.get('principal', 0.0))
                apr = float(pr.get('apr', 0.0))
                term = int(pr.get('term', 1))
                pay = amort(principal, apr, term)
                recurrings.append({'from': pm + 1, 'to': pm + 1 + term, 'amt': pay})
                
    return {'one_times': one_times, 'recurrings': recurrings}

def build_series(
    streams: list,
    spending: float,
    debts: list,
    goals: list,
    statuses: list,
    horizon: int,
    start_bal: float
) -> list:
    arr = []
    bal = start_bal
    debt_out = debt_outflow(debts)
    active_goals = [g for g in goals if g.get('status') in statuses]
    evs = [milestone_events(g, streams, horizon) for g in active_goals]
    
    for i in range(horizon):
        if i > 0:
            bal += income_at(i, streams) - spending - debt_out
        for ev in evs:
            for o in ev['one_times']:
                if o['m'] == i:
                    bal -= o['amt']
            for r in ev['recurrings']:
                if r['from'] <= i < r['to']:
                    bal -= r['amt']
        arr.append(bal)
    return arr

def simulate_debts(debts: list, extra: float, strategy: str) -> dict:
    bals = []
    for d in debts:
        if d.get('active', True) and float(d.get('balance', 0.0)) > 0:
            bals.append({
                'apr': float(d.get('apr', 0.0)),
                'min': float(d.get('minPayment', 0.0)),
                'bal': float(d.get('balance', 0.0))
            })
    
    series = []
    total_interest = 0.0
    month = 0
    max_months = 600
    
    start_total = sum(d['bal'] for d in bals)
    series.append(start_total)
    
    while any(d['bal'] > 0.5 for d in bals) and month < max_months:
        month += 1
        budget = sum(d['min'] for d in bals if d['bal'] > 0.5) + extra
        
        for d in bals:
            if d['bal'] <= 0.5:
                continue
            interest = (d['bal'] * d['apr']) / 100.0 / 12.0
            d['bal'] += interest
            total_interest += interest
            
        # sort order of payments
        active_debts = [d for d in bals if d['bal'] > 0.5]
        if strategy == 'snowball':
            # sort by balance ascending
            active_debts.sort(key=lambda x: x['bal'])
        else:
            # avalanche: sort by APR descending
            active_debts.sort(key=lambda x: x['apr'], reverse=True)
            
        for d in active_debts:
            if budget <= 0:
                break
            pay = min(budget, d['bal'])
            d['bal'] -= pay
            budget -= pay
            
        series.append(sum(max(0.0, d['bal']) for d in bals))
        
    return {
        'months': None if month >= max_months else month,
        'totalInterest': total_interest,
        'series': series
    }

def start_balance(accounts: list, fallback: float = 8200.0) -> float:
    if not accounts:
        return fallback
    return sum(float(x.get('balance', 0.0)) for x in accounts)

