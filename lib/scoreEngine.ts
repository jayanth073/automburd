import type { UoMType } from './types';
import { SCORE_CAP } from './constants';

export function computeScore(uomType: UoMType, target: string, actual: string): number {
  if (uomType === 'ZERO') {
    const a = parseFloat(actual);
    return a === 0 ? 1.0 : 0.0;
  }

  if (uomType === 'TIMELINE') {
    const deadline = new Date(target);
    const completed = new Date(actual);
    if (isNaN(deadline.getTime()) || isNaN(completed.getTime())) return 0;
    if (completed <= deadline) return 1.0;
    const daysLate = (completed.getTime() - deadline.getTime()) / 86400000;
    return Math.max(0, 1 - (daysLate / 30));
  }

  const t = parseFloat(target);
  const a = parseFloat(actual);

  if (isNaN(t) || isNaN(a)) {
     return 0;
  }

  switch (uomType) {
    case 'NUMERIC_MIN':
      return Math.min(a / t, SCORE_CAP);

    case 'NUMERIC_MAX':
      if (a === 0) return 1;
      return Math.min(t / a, SCORE_CAP);

    default: return 0;
  }
}
