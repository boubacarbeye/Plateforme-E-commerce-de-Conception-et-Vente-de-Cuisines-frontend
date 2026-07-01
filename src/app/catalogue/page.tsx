'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

interface Module { id: string; nom: string; categorie: string; largeur_cm: number; prix_base: number; image_url: string; }

export default function CataloguePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/modules').then(res => { setModules(Array.isArray(res.data) ? res.data : []); setLoading(false); });
  }, []);

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl text-stone-900 mb-2">Catalogue</h1>
            <p className="text-stone-500 text-lg font-light">Sélectionnez vos éléments pour composer votre cuisine sur mesure.</p>
          </div>
          <Link href="/configurateur/nouveau" className="bg-stone-900 text-white px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wider hover:bg-stone-700 transition shadow-sm">
            Démarrer une cuisine
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <p className="text-stone-400 col-span-full text-center py-20 text-lg">Chargement des modules...</p>
          ) : (
            modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-52 bg-stone-50 overflow-hidden relative flex items-center justify-center">
                  {mod.image_url ? (
                    <img src={`http://127.0.0.1:8000${mod.image_url}`} alt={mod.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                       <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       <span className="text-xs font-medium">Aucune image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-700 uppercase tracking-wider shadow-sm">
                    {mod.categorie.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-1">{mod.nom}</h3>
                  <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">Largeur : {mod.largeur_cm} cm</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="block text-xs text-stone-400 mb-1">Prix unitaire</span>
                      <span className="text-2xl font-bold text-stone-900">{Number(mod.prix_base).toLocaleString()} <span className="text-sm font-medium text-stone-500">FCFA</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}