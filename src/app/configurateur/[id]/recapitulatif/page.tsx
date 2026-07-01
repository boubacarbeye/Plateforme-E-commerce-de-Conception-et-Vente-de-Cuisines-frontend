'use client';
import { useState, useEffect, use } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';

export default function RecapitulatifPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [projet, setProjet] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/projets/${id}`).then(res => setProjet(res.data)).catch(() => setError("Impossible de charger le projet. Avez-vous bien sauvegardé ?"));
  }, [id]);

  const generateDevis = async () => {
    setError('');
    try {
      const res = await api.post(`/projets/${id}/devis`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err: any) {
      if (err.response?.status === 401) setError("Vous devez être connecté pour générer un devis.");
      else setError("Erreur lors de la génération du PDF. Assurez-vous d'avoir sauvegardé le projet.");
    }
  };

  if (!projet && !error) return <div className="p-8 text-center text-stone-500">Chargement du récapitulatif...</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl bg-[#FAFAF9] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl text-stone-900">Récapitulatif & Devis</h1>
        <Link href={`/configurateur/${id}`} className="text-amber-700 hover:underline font-medium">&larr; Retour à la 3D</Link>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}

      {projet && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-6">
            <h2 className="text-xl font-bold mb-4 text-stone-700" style={{fontFamily: 'Playfair Display, serif'}}>Informations de la pièce</h2>
            <p className="text-stone-600">Forme : <span className="font-semibold capitalize">{projet.forme.replace('_', ' en ')}</span></p>
            <p className="text-stone-600">Dimensions : <span className="font-semibold">{projet.longueur_cm} x {projet.largeur_cm} x {projet.hauteur_cm} cm</span></p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="p-4 text-stone-700">Module</th>
                  <th className="p-4 text-stone-700">Options</th>
                  <th className="p-4 text-stone-700 text-right">Prix</th>
                </tr>
              </thead>
              <tbody>
                {projet.modules?.length > 0 ? (
                  projet.modules.map((ligne: any) => (
                    <tr key={ligne.id} className="border-b hover:bg-stone-50">
                      <td className="p-4 font-medium text-stone-800">{ligne.module?.nom || 'Module'}</td>
                      <td className="p-4 text-sm text-stone-500">{ligne.materiau ? `${ligne.materiau.nom} (+${ligne.materiau.supplement_prix} FCFA)` : 'Standard'}</td>
                      <td className="p-4 text-right font-semibold text-stone-900">{Number(ligne.module?.prix_base || 0) + Number(ligne.materiau?.supplement_prix || 0)} FCFA</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="p-4 text-center text-stone-400">Aucun module sauvegardé.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-stone-900 p-8 rounded-2xl shadow-lg">
            <div>
              <span className="text-stone-400 text-sm uppercase tracking-wider">Total estimé</span>
              <div className="text-4xl font-bold text-white" style={{fontFamily: 'Playfair Display, serif'}}>{Number(projet.prix_estime || 0).toLocaleString()} <span className="text-lg text-stone-400">FCFA</span></div>
            </div>
            <button onClick={generateDevis} className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-md transition flex items-center gap-2">
              📄 Générer le Devis PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}