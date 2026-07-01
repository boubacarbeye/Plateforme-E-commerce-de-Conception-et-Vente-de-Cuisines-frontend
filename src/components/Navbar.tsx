// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname(); // Récupère l'URL actuelle

  // Fonction pour vérifier si le lien est actif
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) => {
    return `text-sm font-medium transition uppercase tracking-wider px-4 py-2 rounded-full ${
      isActive(href) 
        ? 'bg-amber-100 text-amber-800' 
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/60 py-4">
      <div className="container mx-auto flex justify-between items-center px-8">
        
        <Link href="/" className="text-2xl font-bold text-stone-900 tracking-tight" style={{fontFamily: 'ui-serif, Georgia, serif'}}>
          DGS<span className="text-amber-700">.</span>3D
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/catalogue" className={linkClass('/catalogue')}>
            Catalogue
          </Link>

          {token ? (
            <>
              <Link href="/compte/projets" className={linkClass('/compte/projets')}>
                Mes Projets
              </Link>
              
              {user?.role === 'admin' && (
                <Link href="/admin/modules" className={linkClass('/admin')}>
                  Admin
                </Link>
              )}

              <button 
                onClick={logout} 
                className="ml-4 bg-stone-900 text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-stone-700 transition tracking-wider uppercase"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className="ml-4 bg-amber-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-amber-800 transition tracking-wider uppercase">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}