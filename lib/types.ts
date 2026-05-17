export type UoMType = 'NUMERIC_MIN' | 'NUMERIC_MAX' | 'TIMELINE' | 'ZERO';
export type GoalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';
export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
export type ProgressStatus = 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED' | 'AT_RISK';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type ChangeType = 'FIELD_EDIT' | 'APPROVE' | 'RETURN' | 'SYSTEM_UNLOCK' | 'BROADCAST_KPI';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  managerId?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  thrustArea: string;
  title: string;
  description: string;
  uomType: UoMType;
  target: string;
  weightage: number;
  status: GoalStatus;
  isLocked: boolean;
  isShared: boolean;
  sharedFromId?: string;
  managerComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  goalId: string;
  employeeId: string;
  quarter: Quarter;
  actualAchievement: string;
  progressStatus: ProgressStatus;
  computedScore: number;
  managerComment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  goalId?: string;
  userId: string;
  userName: string;
  goalTitle?: string;
  changeType: ChangeType | string;
  fieldName?: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
}

export interface GoalCycle {
  id: string;
  name: string;
  isActive: boolean;
  windowOpen: string;
  windowClose: string;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  type: string;
  deepLink?: string;
  sentAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

export interface TeamsNotification {
  id: string;
  channel: string;
  message: string;
  adaptiveCard?: any;
  deepLink?: string;
  sentAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

export interface NotificationStore {
  emails: EmailNotification[];
  teams: TeamsNotification[];
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: 'GOAL_NOT_SUBMITTED' | 'GOAL_NOT_APPROVED' | 'CHECKIN_NOT_COMPLETED';
  daysThreshold: number;
  escalationChain: ('EMPLOYEE' | 'MANAGER' | 'HR' | 'SKIP_LEVEL')[];
  isActive: boolean;
}

export interface EscalationHistory {
  level: number;
  role: string;
  notifiedAt: string;
  action: 'NOTIFIED' | 'ESCALATED' | 'RESOLVED';
}

export interface Escalation {
  id: string;
  ruleId: string;
  ruleName: string;
  employeeId: string;
  employeeName: string;
  currentLevel: number;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  triggeredAt: string;
  resolvedAt?: string;
  history: EscalationHistory[];
}

export interface Database {
  users: User[];
  goals: Goal[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  goalCycles: GoalCycle[];
  notifications?: NotificationStore;
  escalationRules?: EscalationRule[];
  escalations?: Escalation[];
}
