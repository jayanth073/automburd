export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export const QUARTER_ORDER: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };

export const SCORE_CAP = 1.5;

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const VALID_PROGRESS_STATUSES = ['NOT_STARTED', 'ON_TRACK', 'COMPLETED', 'AT_RISK'] as const;

export const VALID_UOM_TYPES = ['NUMERIC_MIN', 'NUMERIC_MAX', 'TIMELINE', 'ZERO'] as const;
