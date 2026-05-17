import { readDb, writeDb } from './db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export type NotificationType = 
  | 'GOAL_CREATED'
  | 'GOAL_SUBMITTED'
  | 'GOAL_APPROVED'
  | 'GOAL_RETURNED'
  | 'GOAL_EDITED'
  | 'CHECKIN_SUBMITTED'
  | 'CHECKIN_REMINDER'
  | 'ESCALATION';

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  type: NotificationType;
  deepLink?: string;
  sentAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

export interface TeamsNotification {
  id: string;
  channel: string;
  message: string;
  adaptiveCard: any;
  deepLink?: string;
  sentAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
}

function generateDeepLink(path: string, params?: Record<string, string>): string {
  const url = new URL(path, APP_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
}

const EMAIL_TEMPLATES = {
  GOAL_CREATED: (employeeName: string, deepLink: string) => ({
    subject: 'New Goal Created',
    body: `Hi ${employeeName}, you have created a new goal. Click here to view and edit your goals.`,
    htmlBody: `<p>Hi ${employeeName},</p><p>You have created a new goal.</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View Goals</a></p>`
  }),
  GOAL_SUBMITTED: (employeeName: string, managerName: string, deepLink: string) => ({
    subject: 'Goal Sheet Submitted for Approval',
    body: `${employeeName} has submitted their goal sheet. Review and approve: ${deepLink}`,
    htmlBody: `<p>${employeeName} has submitted their goal sheet for your review.</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Review Goals</a></p>`
  }),
  GOAL_APPROVED: (employeeName: string, deepLink: string) => ({
    subject: 'Your Goals Have Been Approved',
    body: `Hi ${employeeName}, your goal sheet has been approved! View your approved goals: ${deepLink}`,
    htmlBody: `<p>Hi ${employeeName},</p><p>Your goal sheet has been approved by your manager. You can now proceed with tracking your achievements.</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View Goals</a></p>`
  }),
  GOAL_RETURNED: (employeeName: string, comment: string, deepLink: string) => ({
    subject: 'Goal Sheet Returned for Rework',
    body: `Hi ${employeeName}, your goal sheet has been returned. Feedback: "${comment}". Edit goals: ${deepLink}`,
    htmlBody: `<p>Hi ${employeeName},</p><p>Your goal sheet has been returned for rework.</p><p><strong>Manager Feedback:</strong> "${comment}"</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Edit Goals</a></p>`
  }),
  GOAL_EDITED: (employeeName: string, goalTitle: string, deepLink: string) => ({
    subject: `Goal Updated: ${goalTitle}`,
    body: `${employeeName} has updated their goal "${goalTitle}". View changes: ${deepLink}`,
    htmlBody: `<p>${employeeName} has updated their goal "<strong>${goalTitle}</strong>".</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View Details</a></p>`
  }),
  CHECKIN_REMINDER: (employeeName: string, quarter: string, deepLink: string) => ({
    subject: `Quarterly Check-in Reminder - ${quarter}`,
    body: `Hi ${employeeName}, please complete your ${quarter} check-in before the deadline. ${deepLink}`,
    htmlBody: `<p>Hi ${employeeName},</p><p>This is a reminder to complete your <strong>${quarter}</strong> check-in before the deadline.</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Complete Check-in</a></p>`
  }),
  CHECKIN_SUBMITTED: (employeeName: string, quarter: string, goalTitle: string, deepLink: string) => ({
    subject: `${employeeName} Completed ${quarter} Check-in`,
    body: `${employeeName} submitted ${quarter} check-in for "${goalTitle}". Review: ${deepLink}`,
    htmlBody: `<p>${employeeName} has submitted their <strong>${quarter}</strong> check-in.</p><p><strong>Goal:</strong> ${goalTitle}</p><p><a href="${deepLink}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Review Check-in</a></p>`
  }),
  ESCALATION: (recipientName: string, escalationType: string, details: string, deepLink: string) => ({
    subject: `Escalation: ${escalationType}`,
    body: `${details} View details: ${deepLink}`,
    htmlBody: `<p>Dear ${recipientName},</p><p><strong>Escalation Alert:</strong> ${escalationType}</p><p>${details}</p><p><a href="${deepLink}" style="background:#dc2626;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View Escalation</a></p>`
  })
};

function createTeamsAdaptiveCard(
  title: string,
  subtitle: string,
  text: string,
  deepLink: string,
  actionType: 'openUrl' | 'execute' = 'openUrl'
) {
  return {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: title,
        weight: 'Bolder',
        size: 'Medium'
      },
      {
        type: 'TextBlock',
        text: subtitle,
        isSubtle: true,
        spacing: 'None'
      },
      {
        type: 'TextBlock',
        text: text,
        wrap: true,
        spacing: 'Medium'
      }
    ],
    actions: [
      {
        type: 'Action.Execute',
        title: 'View Details',
        verb: 'viewGoal',
        url: deepLink
      },
      {
        type: 'Action.OpenUrl',
        title: 'Open in Portal',
        url: deepLink
      }
    ]
  };
}

export function sendEmailNotification(
  userId: string,
  type: NotificationType,
  additionalData: Record<string, string> = {}
): EmailNotification | null {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  
  if (!user) return null;

  let template: { subject: string; body: string; htmlBody?: string };
  let deepLink = '';

  switch (type) {
    case 'GOAL_CREATED':
      deepLink = generateDeepLink('/dashboard');
      template = EMAIL_TEMPLATES.GOAL_CREATED(user.name, deepLink);
      break;
    case 'GOAL_SUBMITTED':
      deepLink = generateDeepLink('/manager/team');
      template = EMAIL_TEMPLATES.GOAL_SUBMITTED(additionalData.employeeName || user.name, additionalData.managerName || '', deepLink);
      break;
    case 'GOAL_APPROVED':
      deepLink = generateDeepLink('/dashboard');
      template = EMAIL_TEMPLATES.GOAL_APPROVED(user.name, deepLink);
      break;
    case 'GOAL_RETURNED':
      deepLink = generateDeepLink('/dashboard');
      template = EMAIL_TEMPLATES.GOAL_RETURNED(user.name, additionalData.comment || '', deepLink);
      break;
    case 'GOAL_EDITED':
      deepLink = generateDeepLink('/manager/team', { employeeId: additionalData.employeeId });
      template = EMAIL_TEMPLATES.GOAL_EDITED(user.name, additionalData.goalTitle || '', deepLink);
      break;
    case 'CHECKIN_REMINDER':
      deepLink = generateDeepLink('/checkins');
      template = EMAIL_TEMPLATES.CHECKIN_REMINDER(user.name, additionalData.quarter || '', deepLink);
      break;
    case 'CHECKIN_SUBMITTED':
      deepLink = generateDeepLink('/manager/checkins/' + (additionalData.employeeId || ''));
      template = EMAIL_TEMPLATES.CHECKIN_SUBMITTED(user.name, additionalData.quarter || '', additionalData.goalTitle || '', deepLink);
      break;
    case 'ESCALATION':
      deepLink = generateDeepLink('/admin/escalations');
      template = EMAIL_TEMPLATES.ESCALATION(user.name, additionalData.escalationType || '', additionalData.details || '', deepLink);
      break;
    default:
      deepLink = generateDeepLink('/dashboard');
      template = { subject: 'Notification', body: 'You have a new notification', htmlBody: '<p>You have a new notification.</p>' };
  }
  
  const emailContent = { ...template, ...additionalData };

  const notification: EmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    to: user.email,
    subject: emailContent.subject || template.subject,
    body: emailContent.body || template.body,
    htmlBody: emailContent.htmlBody || template.htmlBody,
    type,
    deepLink,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };

  if (!db.notifications) {
    db.notifications = { emails: [], teams: [] };
  }
  db.notifications.emails.push(notification);
  writeDb(db);

  return notification;
}

export function sendTeamsNotification(
  channelId: string,
  message: string,
  adaptiveCard: any = null,
  deepLink?: string
): TeamsNotification | null {
  const db = readDb();

  const notification: TeamsNotification = {
    id: `teams-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    channel: channelId,
    message,
    adaptiveCard,
    deepLink,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };

  if (!db.notifications) {
    db.notifications = { emails: [], teams: [] };
  }
  db.notifications.teams.push(notification);
  writeDb(db);

  return notification;
}

export function sendTeamsGoalNotification(
  recipientId: string,
  type: 'GOAL_SUBMITTED' | 'CHECKIN_SUBMITTED' | 'GOAL_APPROVED' | 'GOAL_RETURNED',
  data: {
    employeeName?: string;
    goalTitle?: string;
    quarter?: string;
    comment?: string;
    employeeId?: string;
  }
): void {
  const db = readDb();
  const recipient = db.users.find((u) => u.id === recipientId);
  if (!recipient) return;

  let title = '';
  let subtitle = '';
  let text = '';
  let deepLink = '';

  switch (type) {
    case 'GOAL_SUBMITTED':
      title = '🎯 Goal Sheet Submitted';
      subtitle = `From ${data.employeeName}`;
      text = `${data.employeeName} has submitted their goal sheet for your review.`;
      deepLink = generateDeepLink('/manager/team');
      break;
    case 'CHECKIN_SUBMITTED':
      title = '📊 Check-in Submitted';
      subtitle = `${data.employeeName} - ${data.quarter}`;
      text = `${data.employeeName} submitted their ${data.quarter} check-in for "${data.goalTitle}".`;
      deepLink = generateDeepLink(`/manager/checkins/${data.employeeId}`);
      break;
    case 'GOAL_APPROVED':
      title = '✅ Goals Approved';
      subtitle = `For ${data.employeeName}`;
      text = `Your goals have been approved by your manager.`;
      deepLink = generateDeepLink('/dashboard');
      break;
    case 'GOAL_RETURNED':
      title = '📝 Goals Returned';
      subtitle = `For ${data.employeeName}`;
      text = `Your goals have been returned for rework. Feedback: ${data.comment}`;
      deepLink = generateDeepLink('/dashboard');
      break;
  }

  const card = createTeamsAdaptiveCard(title, subtitle, text, deepLink);
  sendTeamsNotification(`user-${recipientId}`, text, card, deepLink);
}

export function notifyManagerOnGoalSubmit(employeeId: string): void {
  const db = readDb();
  const employee = db.users.find((u) => u.id === employeeId);
  if (!employee || !employee.managerId) return;

  const manager = db.users.find((u) => u.id === employee.managerId);
  if (!manager) return;

  sendEmailNotification(manager.id, 'GOAL_SUBMITTED', { 
    employeeName: employee.name,
    managerName: manager.name 
  });
  
  sendTeamsGoalNotification(manager.id, 'GOAL_SUBMITTED', {
    employeeName: employee.name,
    employeeId: employee.id
  });
}

export function notifyEmployeeOnApproval(employeeId: string): void {
  sendEmailNotification(employeeId, 'GOAL_APPROVED');
  
  const db = readDb();
  const employee = db.users.find((u) => u.id === employeeId);
  if (employee) {
    sendTeamsGoalNotification(employeeId, 'GOAL_APPROVED', { employeeName: employee.name });
  }
}

export function notifyEmployeeOnReturn(employeeId: string, comment: string): void {
  sendEmailNotification(employeeId, 'GOAL_RETURNED', { comment });
  
  const db = readDb();
  const employee = db.users.find((u) => u.id === employeeId);
  if (employee) {
    sendTeamsGoalNotification(employeeId, 'GOAL_RETURNED', { 
      employeeName: employee.name,
      comment 
    });
  }
}

export function notifyManagerOnCheckin(employeeId: string, quarter: string): void {
  const db = readDb();
  const employee = db.users.find((u) => u.id === employeeId);
  if (!employee || !employee.managerId) return;

  const manager = db.users.find((u) => u.id === employee.managerId);
  if (!manager) return;

  const goal = db.goals.find((g) => g.employeeId === employeeId && g.status === 'APPROVED');

  sendEmailNotification(manager.id, 'CHECKIN_SUBMITTED', { 
    employeeName: employee.name,
    quarter,
    goalTitle: goal?.title || ''
  });
  
  sendTeamsGoalNotification(manager.id, 'CHECKIN_SUBMITTED', {
    employeeName: employee.name,
    employeeId: employee.id,
    quarter,
    goalTitle: goal?.title || ''
  });
}

export function sendCheckinReminders(quarter: string): void {
  const db = readDb();
  const employees = db.users.filter((u) => u.role === 'EMPLOYEE');
  
  employees.forEach((emp) => {
    const hasCheckin = db.checkIns.some((ci) => ci.employeeId === emp.id && ci.quarter === quarter);
    if (!hasCheckin) {
      sendEmailNotification(emp.id, 'CHECKIN_REMINDER', { quarter });
    }
  });
}