// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const navItems = [
  { href: '/admin/modules', label: 'Modules' },
  { href: '/admin/materiaux', label: 'Matériaux & Finitions' },
  { href: '/admin/users', label: 'Utilisateurs' }, // <-- AJOUT ICI
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && (!token || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [hasHydrated, token, user, router]);

  if (!hasHydrated || !token || user?.role !== 'admin') {
    return <div className="h-screen flex items-center justify-center text-slate-500">Chargement de l'espace administrateur...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8 text-amber-400" style={{fontFamily: 'ui-serif, Georgia, serif'}}>DGS Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded transition font-medium ${
                pathname.startsWith(item.href) ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}