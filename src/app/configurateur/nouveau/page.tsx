'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function NouveauProjetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ longueur_cm: 300, largeur_cm: 300, hauteur_cm: 250, forme: 'lineaire' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/projets', formData);
      router.push(`/configurateur/${res.data.id}`);
    } catch (err: any) {
      setError("Une erreur est survenue lors de la création du projet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 bg-[#FAFAF9]">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg border border-stone-100">
        <h1 className="text-4xl text-stone-900 mb-2">Nouvelle Cuisine</h1>
        <p className="text-stone-500 mb-8 font-light">Configurez les dimensions de votre pièce. (Aucun compte requis pour tester)</p>
        {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Forme de la pièce</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({...formData, forme: 'lineaire'})} className={`p-4 border-2 rounded-xl font-semibold transition ${formData.forme === 'lineaire' ? 'border-amber-700 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>Linéaire</button>
              <button type="button" onClick={() => setFormData({...formData, forme: 'en_L'})} className={`p-4 border-2 rounded-xl font-semibold transition ${formData.forme === 'en_L' ? 'border-amber-700 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>En L</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Longueur</label>
              <input type="number" value={formData.longueur_cm} onChange={(e) => setFormData({...formData, longueur_cm: +e.target.value})} className="w-full p-3 border-2 border-stone-200 rounded-xl focus:border-amber-700 outline-none text-stone-900" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Largeur</label>
              <input type="number" value={formData.largeur_cm} onChange={(e) => setFormData({...formData, largeur_cm: +e.target.value})} className="w-full p-3 border-2 border-stone-200 rounded-xl focus:border-amber-700 outline-none text-stone-900" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Hauteur</label>
              <input type="number" value={formData.hauteur_cm} onChange={(e) => setFormData({...formData, hauteur_cm: +e.target.value})} className="w-full p-3 border-2 border-stone-200 rounded-xl focus:border-amber-700 outline-none text-stone-900" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-700 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 flex justify-center items-center gap-2">
            {loading ? 'Création...' : 'Ouvrir le Configurateur 3D'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}