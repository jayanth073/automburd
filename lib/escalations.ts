import { readDb, writeDb } from './db';
import { sendEmailNotification, sendTeamsNotification } from './notifications';
import { getCurrentQuarterCheckinWindow, isQuarterPast } from './cycleGuard';
import type { EscalationRule, Escalation, EscalationHistory, Database } from './types';

const DEFAULT_RULES: EscalationRule[] = [
  {
    id: 'rule-1',
    name: 'Goal Submission Overdue',
    condition: 'GOAL_NOT_SUBMITTED',
    daysThreshold: 7,
    escalationChain: ['EMPLOYEE', 'MANAGER', 'HR'],
    isActive: true
  },
  {
    id: 'rule-2',
    name: 'Goal Approval Overdue',
    condition: 'GOAL_NOT_APPROVED',
    daysThreshold: 5,
    escalationChain: ['MANAGER', 'SKIP_LEVEL', 'HR'],
    isActive: true
  },
  {
    id: 'rule-3',
    name: 'Quarterly Check-in Overdue',
    condition: 'CHECKIN_NOT_COMPLETED',
    daysThreshold: 3,
    escalationChain: ['EMPLOYEE', 'MANAGER', 'HR'],
    isActive: true
  }
];



export function getEscalationRules(): EscalationRule[] {
  const db = readDb();
  if (!db.escalationRules) {
    db.escalationRules = DEFAULT_RULES;
    writeDb(db);
  }
  return db.escalationRules;
}

export function updateEscalationRule(ruleId: string, updates: Partial<EscalationRule>): EscalationRule | null {
  const db = readDb();
  if (!db.escalationRules) return null;

  const index = db.escalationRules.findIndex(r => r.id === ruleId);
  if (index === -1) return null;

  db.escalationRules[index] = { ...db.escalationRules[index], ...updates };
  writeDb(db);
  return db.escalationRules[index];
}

import { QUARTERS } from './constants';

export function getActiveEscalations(): Escalation[] {
  const db = readDb();
  return db.escalations?.filter(e => e.status === 'ACTIVE') || [];
}

export function getAllEscalations(): Escalation[] {
  const db = readDb();
  return db.escalations || [];
}

export function checkAndTriggerEscalations(): Escalation[] {
  const db = readDb();
  const rules = getEscalationRules().filter(r => r.isActive);
  const newEscalations: Escalation[] = [];

  const activeCycle = db.goalCycles.find(c => c.isActive);
  if (!activeCycle) return [];

  const cycleOpenDate = new Date(activeCycle.windowOpen);
  const today = new Date();
  const daysSinceOpen = Math.floor((today.getTime() - cycleOpenDate.getTime()) / (1000 * 60 * 60 * 24));

  rules.forEach(rule => {
    if (rule.condition === 'GOAL_NOT_SUBMITTED' && daysSinceOpen >= rule.daysThreshold) {
      const employees = db.users.filter(u => u.role === 'EMPLOYEE');
      
      employees.forEach(emp => {
        const empGoals = db.goals.filter(g => g.employeeId === emp.id && g.cycleId === activeCycle.id);
        const hasSubmitted = empGoals.some(g => g.status === 'SUBMITTED' || g.status === 'APPROVED');
        
        if (!hasSubmitted && !hasActiveEscalation(emp.id, rule.id)) {
          const escalation = createEscalation(emp, rule, activeCycle.id);
          if (escalation) newEscalations.push(escalation);
        }
      });
    }

    if (rule.condition === 'CHECKIN_NOT_COMPLETED') {
      const currentQuarter = getCurrentQuarterCheckinWindow();
      
      QUARTERS.forEach(q => {
        if (q === currentQuarter || isQuarterPast(q)) {
          const employees = db.users.filter(u => u.role === 'EMPLOYEE');
          
          employees.forEach(emp => {
            const hasCheckin = db.checkIns.some(ci => ci.employeeId === emp.id && ci.quarter === q);
            
            if (!hasCheckin && !hasActiveEscalation(emp.id, rule.id)) {
              const escalation = createEscalation(emp, rule, activeCycle.id);
              if (escalation) newEscalations.push(escalation);
            }
          });
        }
      });
    }

    if (rule.condition === 'GOAL_NOT_APPROVED') {
      const submittedGoals = db.goals.filter(g => g.status === 'SUBMITTED');
      
      submittedGoals.forEach(g => {
        const daysSinceSubmit = Math.floor((today.getTime() - new Date(g.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceSubmit >= rule.daysThreshold) {
          const emp = db.users.find(u => u.id === g.employeeId);
          if (emp && !hasActiveEscalation(emp.id, rule.id)) {
            const escalation = createEscalation(emp, rule, activeCycle.id);
            if (escalation) newEscalations.push(escalation);
          }
        }
      });
    }
  });

  return newEscalations;
}

function hasActiveEscalation(employeeId: string, ruleId: string): boolean {
  const db = readDb();
  return db.escalations?.some(e => 
    e.employeeId === employeeId && 
    e.ruleId === ruleId && 
    e.status === 'ACTIVE'
  ) || false;
}

function createEscalation(employee: { id: string; name: string }, rule: EscalationRule, _cycleId: string): Escalation | null {
  const db = readDb();
  
  if (!db.escalations) {
    db.escalations = [];
  }

  const escalation: Escalation = {
    id: `esc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ruleId: rule.id,
    ruleName: rule.name,
    employeeId: employee.id,
    employeeName: employee.name,
    currentLevel: 0,
    status: 'ACTIVE',
    triggeredAt: new Date().toISOString(),
    history: []
  };

  db.escalations.push(escalation);
  writeDb(db);

  notifyEscalation(escalation, rule);

  return escalation;
}

function notifyEscalation(escalation: Escalation, rule: EscalationRule): void {
  const db = readDb();
  const employee = db.users.find(u => u.id === escalation.employeeId);
  
  if (!employee) return;

  const currentRole = rule.escalationChain[escalation.currentLevel];
  
  let recipientId: string | null = null;
  let recipientName = '';
  let message = '';

  switch (currentRole) {
    case 'EMPLOYEE':
      recipientId = employee.id;
      recipientName = employee.name;
      message = `Action Required: ${rule.name}. Please complete your pending tasks immediately.`;
      break;
    case 'MANAGER':
      recipientId = employee.managerId ?? null;
      if (recipientId) {
        const manager = db.users.find(u => u.id === employee.managerId);
        recipientName = manager?.name || 'Manager';
        message = `Escalation: Your team member ${employee.name} has pending ${rule.name}. Please take action.`;
      }
      break;
    case 'SKIP_LEVEL':
      if (employee.managerId) {
        const mgr = db.users.find(u => u.id === employee.managerId);
        if (mgr?.managerId) {
          recipientId = mgr.managerId;
          const skipLevel = db.users.find(u => u.id === mgr.managerId);
          recipientName = skipLevel?.name || 'Skip-Level Manager';
        }
      }
      message = `High Priority Escalation: ${employee.name} - ${rule.name} requires immediate attention.`;
      break;
    case 'HR': {
      const hrUser = db.users.find(u => u.role === 'ADMIN');
      if (hrUser) {
        recipientId = hrUser.id;
        recipientName = hrUser.name;
      }
      message = `High Priority Escalation: ${employee.name} - ${rule.name} requires immediate attention.`;
      break;
    }
  }

  if (recipientId) {
    sendEmailNotification(recipientId, 'ESCALATION', { 
      escalationType: rule.name,
      details: message 
    });
    sendTeamsNotification(`escalation-${currentRole.toLowerCase()}`, message);
  }

  const historyEntry: EscalationHistory = {
    level: escalation.currentLevel,
    role: currentRole,
    notifiedAt: new Date().toISOString(),
    action: 'NOTIFIED'
  };

  const escalationIndex = db.escalations?.findIndex(e => e.id === escalation.id) ?? -1;
  if (escalationIndex > -1 && db.escalations) {
    db.escalations[escalationIndex].history.push(historyEntry);
    writeDb(db);
  }
}

export function resolveEscalation(escalationId: string): boolean {
  const db = readDb();
  if (!db.escalations) return false;

  const index = db.escalations.findIndex(e => e.id === escalationId);
  if (index === -1) return false;

  db.escalations[index].status = 'RESOLVED';
  db.escalations[index].resolvedAt = new Date().toISOString();
  db.escalations[index].history.push({
    level: db.escalations[index].currentLevel,
    role: 'SYSTEM',
    notifiedAt: new Date().toISOString(),
    action: 'RESOLVED'
  });

  writeDb(db);
  return true;
}

export function escalateToNextLevel(escalationId: string): boolean {
  const db = readDb();
  if (!db.escalations) return false;

  const index = db.escalations.findIndex(e => e.id === escalationId);
  if (index === -1) return false;

  const escalation = db.escalations[index];
  const rules = getEscalationRules();
  const rule = rules.find(r => r.id === escalation.ruleId);
  
  if (!rule) return false;

  if (escalation.currentLevel >= rule.escalationChain.length - 1) {
    return false;
  }

  escalation.currentLevel += 1;
  escalation.history.push({
    level: escalation.currentLevel,
    role: rule.escalationChain[escalation.currentLevel],
    notifiedAt: new Date().toISOString(),
    action: 'ESCALATED'
  });

  writeDb(db);
  notifyEscalation(escalation, rule);

  return true;
}