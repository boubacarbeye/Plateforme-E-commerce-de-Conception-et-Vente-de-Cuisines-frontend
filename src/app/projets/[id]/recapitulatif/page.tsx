// src/app/projets/[id]/recapitulatif/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function RecapitulatifPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [projet, setProjet] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/projets/${id}`)
      .then(res => setProjet(res.data))
      .catch(() => setError("Impossible de charger le projet. Avez-vous bien sauvegardé le projet dans le configurateur avant de venir ici ?"));
  }, [id]);

  const generateDevis = async () => {
    setError('');
    try {
      // On demande au backend de générer le PDF
      const res = await api.post(`/projets/${id}/devis`, {}, { responseType: 'blob' });
      
      // On crée un lien temporaire pour ouvrir le PDF dans un nouvel onglet
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err: any) {
      console.error("Erreur Devis:", err);
      if (err.response?.status === 401) {
        setError("Vous devez être connecté pour générer un devis.");
      } else if (err.response?.status === 404) {
        setError("La route du devis est introuvable côté backend. Vérifiez routes/api.php.");
      } else {
        setError("Erreur lors de la génération du PDF. Vérifiez que DOMPDF est installé et que le projet a bien des modules.");
      }
    }
  };

  // Affichage pendant le chargement
  if (!projet && !error) return <div className="p-8 text-center text-gray-500">Chargement du récapitulatif...</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Récapitulatif & Devis</h1>
        <Link href={`/configurateur/${id}`} className="text-blue-600 hover:underline font-medium">&larr; Retour à la 3D</Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {projet && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Informations de la pièce</h2>
            <p className="text-slate-600">Forme : <span className="font-semibold capitalize">{projet.forme.replace('_', ' en ')}</span></p>
            <p className="text-slate-600">Dimensions : <span className="font-semibold">{projet.longueur_cm} x {projet.largeur_cm} x {projet.hauteur_cm} cm</span></p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-slate-700">Module</th>
                  <th className="p-4 text-slate-700">Options</th>
                  <th className="p-4 text-slate-700 text-right">Prix</th>
                </tr>
              </thead>
              <tbody>
                {projet.modules?.length > 0 ? (
                  projet.modules.map((ligne: any) => (
                    <tr key={ligne.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{ligne.module?.nom || 'Module inconnu'}</td>
                      <td className="p-4 text-sm text-slate-500">
                        {ligne.materiau ? `${ligne.materiau.nom} (+${ligne.materiau.supplement_prix} FCFA)` : 'Standard'}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-900">
                        {Number(ligne.module?.prix_base || 0) + Number(ligne.materiau?.supplement_prix || 0)} FCFA
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="p-4 text-center text-slate-400">Aucun module sauvegardé.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div>
              <span className="text-slate-600">Total estimé</span>
              <div className="text-4xl font-extrabold text-blue-600">{Number(projet.prix_estime || 0).toLocaleString()} FCFA</div>
            </div>
            <button onClick={generateDevis} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md transition">
              📄 Générer le Devis PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
