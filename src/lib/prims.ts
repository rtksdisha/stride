import type { PrimKind, Primitive } from '../types';

export function newPrim(kind: PrimKind): Primitive {
  if (kind === 'once') return { kind, label: 'One-time event', amt: 2000, month: 6 };
  if (kind === 'recur') return { kind, label: 'Recurring cost', amt: 300, month: 0, months: 12 };
  return { kind, label: 'Loan', principal: 10000, apr: 7, term: 24, month: 1 };
}

export function addPrim(prims: Primitive[] | undefined, kind: PrimKind): Primitive[] {
  return [...(prims || []), newPrim(kind)];
}

export function setPrim(prims: Primitive[], idx: number, field: keyof Primitive, value: unknown): Primitive[] {
  return prims.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
}

export function removePrim(prims: Primitive[], idx: number): Primitive[] {
  return prims.filter((_, i) => i !== idx);
}
