import { readDb } from './db';
import { QUARTER_ORDER, QUARTERS } from './constants';
import type { Quarter } from './types';

const CHECKIN_WINDOWS: Record<Quarter, { startMonth: number; endMonth: number }> = {
  Q1: { startMonth: 7, endMonth: 7 },
  Q2: { startMonth: 10, endMonth: 10 },
  Q3: { startMonth: 1, endMonth: 1 },
  Q4: { startMonth: 3, endMonth: 4 },
};

export function isWindowOpen(cycleId: string) {
  const db = readDb();
  const cycle = db.goalCycles.find(c => c.id === cycleId);
  return cycle ? cycle.isActive : false;
}

export function getActiveCycle() {
  const db = readDb();
  return db.goalCycles.find(c => c.isActive);
}

export function getCurrentQuarterCheckinWindow() {
  const month = new Date().getMonth() + 1;
  const fiscalMonth = ((month + 5) % 12) + 1;
  return QUARTERS[Math.floor((fiscalMonth - 1) / 3)];
}

export function isCheckinWindowOpen(quarter: string): boolean {
  const db = readDb();
  // Allow check-in if any cycle is active (Admin controls this)
  return db.goalCycles.some(c => c.isActive);
}

export function isQuarterPast(quarter: string): boolean {
  const currentQ = getCurrentQuarterCheckinWindow();
  return (QUARTER_ORDER[quarter] || 0) < (QUARTER_ORDER[currentQ] || 0);
}
