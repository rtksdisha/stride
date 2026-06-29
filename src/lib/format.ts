// Month index 0 = the forecast's anchor month (July 2026), matching the prototype's horizon.
export function monthLabel(i: number): string {
  const d = new Date(2026, 6 + Math.round(i), 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Compact form for chart labels and stat tiles, e.g. -$2.4k, $830.
export function fmt(n: number): string {
  const s = n < 0 ? '-' : '';
  n = Math.abs(Math.round(n));
  if (n >= 1000) {
    const k = n / 1000;
    return s + '$' + (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'k';
  }
  return s + '$' + n;
}

export function money(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function ordinal(n: number): string {
  n = Math.round(n);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function aprPct(apr: number): string {
  return apr.toFixed(2).replace(/\.00$/, '') + '%';
}

export function pctLabel(v: number): string {
  return (+v).toFixed(2).replace(/\.?0+$/, '') + '%';
}

export function parseNumStr(str: string): number | null {
  const c = String(str).replace(/[^0-9.]/g, '');
  if (c === '' || c === '.') return null;
  const n = parseFloat(c);
  return isNaN(n) ? null : n;
}
