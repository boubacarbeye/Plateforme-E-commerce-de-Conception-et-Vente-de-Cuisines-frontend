// src/app/compte/projets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function MesProjetsPage() {
  const [projets, setProjets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjets = async () => {
    api.get('/projets')
      .then(res => setProjets(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erreur", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjets(); }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce projet de cuisine ?")) {
      try {
        await api.delete(`/projets/${id}`);
        fetchProjets(); // Rafraîchir la liste
      } catch (err) {
        alert("Erreur lors de la suppression du projet.");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement de vos projets...</div>;

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl text-slate-900 mb-2" style={{fontFamily: 'ui-serif, Georgia, serif'}}>Mes Projets</h1>
            <p className="text-slate-500">Retrouvez toutes vos configurations de cuisine sauvegardées.</p>
          </div>
          <Link href="/catalogue" className="bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-700 transition shadow-sm uppercase tracking-wider">Nouvelle Cuisine</Link>
        </div>

        {projets.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2" style={{fontFamily: 'ui-serif, Georgia, serif'}}>Aucun projet pour le moment</h3>
            <p className="text-slate-500 mb-6">Commencez à concevoir votre cuisine sur mesure dès maintenant.</p>
            <Link href="/catalogue" className="bg-amber-700 text-white px-6 py-3 rounded-full font-medium hover:bg-amber-800 transition">Démarrer une conception</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projets.map((projet) => (
              <div key={projet.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="h-32 bg-slate-900 relative p-4 flex items-end">
                  <span className="text-white font-bold text-lg capitalize z-10" style={{fontFamily: 'ui-serif, Georgia, serif'}}>Cuisine {projet.forme.replace('_', ' en ')}</span>
                  <div className="absolute top-4 right-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${projet.statut === 'brouillon' ? 'bg-slate-200 text-slate-700' : 'bg-green-100 text-green-700'}`}>{projet.statut}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    {projet.longueur_cm} x {projet.largeur_cm} cm
                  </div>
                  <div className="mt-auto">
                    <div className="text-xs text-slate-400 mb-1">Budget estimé</div>
                    <div className="text-3xl font-bold text-slate-900 mb-4" style={{fontFamily: 'ui-serif, Georgia, serif'}}>{Number(projet.prix_estime).toLocaleString()} <span className="text-sm font-medium text-slate-500">FCFA</span></div>
                    <div className="flex gap-2">
                      <Link href={`/configurateur/${projet.id}`} className="flex-1 text-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition">Modifier</Link>
                      <Link href={`/projets/${projet.id}/recapitulatif`} className="flex-1 text-center py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition">Voir le devis</Link>
                      <button onClick={() => handleDelete(projet.id)} className="px-3 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition" title="Supprimer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}