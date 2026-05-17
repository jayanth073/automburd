import { readDb } from './db';
import { QUARTERS } from './constants';
import type { Goal, CheckIn } from './types';

export function getAnalyticsOverview() {
  const db = readDb();
  
  const totalEmployees = db.users.filter(u => u.role === 'EMPLOYEE').length;
  const totalGoals = db.goals.length;
  const approvedGoals = db.goals.filter(g => g.status === 'APPROVED').length;
  const submittedGoals = db.goals.filter(g => g.status === 'SUBMITTED').length;
  const draftGoals = db.goals.filter(g => g.status === 'DRAFT').length;

  const totalCheckins = db.checkIns.length;
  const completedCheckins = db.checkIns.filter(ci => ci.progressStatus === 'COMPLETED').length;
  const onTrackCheckins = db.checkIns.filter(ci => ci.progressStatus === 'ON_TRACK').length;

  const avgScore = totalCheckins > 0 
    ? db.checkIns.reduce((sum, ci) => sum + (ci.computedScore || 0), 0) / totalCheckins 
    : 0;

  return {
    totalEmployees,
    totalGoals,
    approvedGoals,
    submittedGoals,
    draftGoals,
    totalCheckins,
    completedCheckins,
    onTrackCheckins,
    avgScore: (avgScore * 100).toFixed(1),
    completionRate: totalGoals > 0 ? ((approvedGoals / totalGoals) * 100).toFixed(1) : '0'
  };
}

export function getQuarterlyTrends() {
  const db = readDb();
  
  return QUARTERS.map(quarter => {
    const quarterCheckins = db.checkIns.filter(ci => ci.quarter === quarter);
    const avgScore = quarterCheckins.length > 0 
      ? quarterCheckins.reduce((sum, ci) => sum + (ci.computedScore || 0), 0) / quarterCheckins.length 
      : 0;
    
    return {
      quarter,
      totalCheckins: quarterCheckins.length,
      completed: quarterCheckins.filter(ci => ci.progressStatus === 'COMPLETED').length,
      onTrack: quarterCheckins.filter(ci => ci.progressStatus === 'ON_TRACK').length,
      avgScore: (avgScore * 100).toFixed(1)
    };
  });
}

export function getGoalDistributionByThrustArea() {
  const db = readDb();
  
  const distribution: Record<string, number> = {};
  db.goals.forEach(g => {
    const area = g.thrustArea || 'Uncategorized';
    distribution[area] = (distribution[area] || 0) + 1;
  });

  return Object.entries(distribution).map(([area, count]) => ({
    area,
    count,
    percentage: ((count / db.goals.length) * 100).toFixed(1)
  }));
}

export function getGoalDistributionByUom() {
  const db = readDb();
  
  const distribution: Record<string, number> = {};
  db.goals.forEach(g => {
    const uom = g.uomType || 'Unknown';
    distribution[uom] = (distribution[uom] || 0) + 1;
  });

  return Object.entries(distribution).map(([uom, count]) => ({
    uom,
    count,
    percentage: ((count / db.goals.length) * 100).toFixed(1)
  }));
}

export function getGoalDistributionByStatus() {
  const db = readDb();
  
  const statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED'] as const;
  return statuses.map(status => {
    const count = db.goals.filter(g => g.status === status).length;
    return {
      status,
      count,
      percentage: db.goals.length > 0 ? ((count / db.goals.length) * 100).toFixed(1) : '0'
    };
  });
}

export function getManagerEffectiveness() {
  const db = readDb();
  
  return db.users.filter(u => u.role === 'MANAGER').map(manager => {
    const teamMembers = db.users.filter(u => u.managerId === manager.id);
    const teamMemberIds = new Set(teamMembers.map(m => m.id));
    
    const teamGoals = db.goals.filter(g => teamMemberIds.has(g.employeeId));
    const approvedGoals = teamGoals.filter(g => g.status === 'APPROVED').length;
    
    const teamCheckins = db.checkIns.filter(ci => teamMemberIds.has(ci.employeeId));
    const checkinsWithComments = teamCheckins.filter(ci => ci.managerComment).length;
    
    return {
      managerId: manager.id,
      managerName: manager.name,
      teamSize: teamMembers.length,
      teamGoals: teamGoals.length,
      approvedGoals,
      approvalRate: teamGoals.length > 0 ? ((approvedGoals / teamGoals.length) * 100).toFixed(1) : '0',
      totalCheckins: teamCheckins.length,
      checkinsWithComments,
      feedbackRate: teamCheckins.length > 0 ? ((checkinsWithComments / teamCheckins.length) * 100).toFixed(1) : '0'
    };
  });
}

export function getDepartmentHeatmap() {
  const db = readDb();
  
  const thrustAreas = Array.from(new Set(db.goals.map(g => g.thrustArea).filter(Boolean) as string[]));
  const heatmap: { area: string; Q1: string; Q2: string; Q3: string; Q4: string }[] = [];
  
  thrustAreas.forEach(area => {
    const row: { area: string; Q1: string; Q2: string; Q3: string; Q4: string } = { area, Q1: '0', Q2: '0', Q3: '0', Q4: '0' };
    const areaGoalIds = new Set(db.goals.filter(g => g.thrustArea === area).map(g => g.id));
    
    QUARTERS.forEach(quarter => {
      const quarterCheckins = db.checkIns.filter(ci => areaGoalIds.has(ci.goalId) && ci.quarter === quarter);
      const avgScore = quarterCheckins.length > 0
        ? quarterCheckins.reduce((sum, ci) => sum + (ci.computedScore || 0), 0) / quarterCheckins.length
        : 0;
      row[quarter] = (avgScore * 100).toFixed(1);
    });
    
    heatmap.push(row);
  });
  
  return heatmap;
}

export function getAllAnalytics() {
  return {
    overview: getAnalyticsOverview(),
    quarterlyTrends: getQuarterlyTrends(),
    goalDistributionByArea: getGoalDistributionByThrustArea(),
    goalDistributionByUom: getGoalDistributionByUom(),
    goalDistributionByStatus: getGoalDistributionByStatus(),
    managerEffectiveness: getManagerEffectiveness(),
    departmentHeatmap: getDepartmentHeatmap()
  };
}