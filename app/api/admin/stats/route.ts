import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUARTERS } from '@/lib/constants';

export async function GET(_req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  const goals = db.goals;
  const checkIns = db.checkIns;
  const users = db.users;

  const totalGoals = goals.length;
  const approved = goals.filter(g => g.status === 'APPROVED').length;
  const completionRate = totalGoals > 0 ? (approved / totalGoals) * 100 : 0;
  
  const statusCounts: Record<string, number> = {};
  goals.forEach(g => {
    statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
  });

  const escalations: { type: string; user: string; action: string; days: string }[] = [];
  const employees = users.filter(u => u.role === 'EMPLOYEE');
  for (const u of employees) {
    const hasSubmitted = goals.some(g => g.employeeId === u.id && 
      (g.status === 'SUBMITTED' || g.status === 'APPROVED'));
    if (!hasSubmitted) {
      escalations.push({ type: 'OVERDUE', user: u.name, action: 'Goal Submission', days: '7+' });
    }
  }
  
  const pendingGoals = goals.filter(g => g.status === 'SUBMITTED');
  const uniqueManagers = Array.from(new Set(pendingGoals.map(g => {
    const emp = users.find(u => u.id === g.employeeId);
    return emp?.managerId;
  }))).filter((id): id is string => !!id);

  for (const mid of uniqueManagers) {
    const manager = users.find(u => u.id === mid);
    escalations.push({ type: 'PENDING', user: manager?.name || 'Manager', action: 'Team Approval', days: '3+' });
  }

  const completionTracking = employees.map(u => {
    const empGoals = goals.filter(g => g.employeeId === u.id && g.status === 'APPROVED');
    const empCheckins = checkIns.filter(ci => ci.goalId && empGoals.some(eg => eg.id === ci.goalId));
    const uniqueCheckedInGoalIds = new Set(empCheckins.map(ci => ci.goalId));
    
    return {
      name: u.name,
      goals: empGoals.length,
      checkins: uniqueCheckedInGoalIds.size
    };
  });

  const employeeDetails = employees.map(u => ({ id: u.id, name: u.name, email: u.email }));

  const quarterlyCompliance = employees.map(u => {
    const empApprovedGoals = goals.filter(g => g.employeeId === u.id && g.status === 'APPROVED');
    const quarters = QUARTERS.map(q => {
      const goalCheckins = empApprovedGoals.filter(g => checkIns.some(ci => ci.goalId === g.id && ci.quarter === q));
      return { quarter: q, checkedIn: goalCheckins.length, total: empApprovedGoals.length };
    });
    return { name: u.name, id: u.id, quarters };
  });

  const managers = users.filter(u => u.role === 'MANAGER');
  const managerCompliance = managers.map(m => {
    const team = users.filter(u => u.managerId === m.id);
    const teamCheckinRates = QUARTERS.map(q => {
      const teamApproved = goals.filter(g => team.some(t => t.id === g.employeeId) && g.status === 'APPROVED');
      const teamCheckins = teamApproved.filter(g => checkIns.some(ci => ci.goalId === g.id && ci.quarter === q));
      return {
        quarter: q,
        rate: teamApproved.length > 0 ? Math.round((teamCheckins.length / teamApproved.length) * 100) : 0,
        completed: teamCheckins.length,
        total: teamApproved.length
      };
    });
    return { name: m.name, id: m.id, teamSize: team.length, teamCheckinRates };
  });

  return NextResponse.json({
    totalGoals,
    approved,
    completionRate,
    statusCounts,
    recentCheckins: [...checkIns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    escalations: escalations.slice(0, 3),
    completionTracking,
    quarterlyCompliance,
    managerCompliance,
    employeeCount: employeeDetails.length,
    employeeDetails
  });
}
