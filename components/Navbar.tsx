'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const sessionCookie = cookies.find(row => row.startsWith('session='));
    if (sessionCookie) {
      try {
        const cookieValue = sessionCookie.split('=').slice(1).join('=');
        const payloadBase64 = cookieValue.split('.')[0];
        const userData = JSON.parse(atob(payloadBase64));
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (user?.email && user?.role === 'ADMIN') {
      fetch('/api/admin/notifications')
        .then(res => res.json())
        .then(data => {
          const emails = data.emails || [];
          const userNotifs = emails.filter((e: any) => e.to === user.email).length;
          setNotifCount(userNotifs);
        })
        .catch(() => {});
    }
  }, [user]);

  if (pathname === '/login' || !user) return null;

  const navLinks = [
    { href: '/dashboard', label: 'My Goals', roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'] },
    { href: '/checkins', label: 'Check-ins', roles: ['EMPLOYEE'] },
    { href: '/manager/team', label: 'Team', roles: ['MANAGER', 'ADMIN'] },
    { href: '/manager/reports', label: 'Reports', roles: ['MANAGER', 'ADMIN'] },
    { href: '/admin/dashboard', label: 'Governance', roles: ['ADMIN'] },
    { href: '/admin/users', label: 'Directory', roles: ['ADMIN'] },
    { href: '/admin/analytics', label: 'Analytics', roles: ['ADMIN'] },
    { href: '/admin/escalations', label: 'Escalations', roles: ['ADMIN'] },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-surface-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {pathname !== '/dashboard' && (
            <button onClick={() => router.back()} className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-all" title="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-surface-900 tracking-tight">AtomQuest</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(link => link.roles.includes(user.role)).map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="relative p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-50 rounded-lg transition-all" title="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-surface-900 leading-tight group-hover:text-brand-600 transition-colors">{user.name}</div>
                <div className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{user.role}</div>
              </div>
              <div className="h-9 w-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                {user.name?.[0]}
              </div>
            </Link>
          </div>

          <Link href="/profile" className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Link>

          <a href="/logout" className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}