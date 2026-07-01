// src/app/admin/materiaux/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Materiau {
  id: string;
  nom: string;
  type: string;
  supplement_prix: number;
}

export default function AdminMateriauxPage() {
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<Materiau | null>(null);
  const [formData, setFormData] = useState({ nom: '', type: 'couleur', supplement_prix: 0 });

  const fetchMateriaux = async () => {
    const res = await api.get('/materiaux');
    setMateriaux(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { fetchMateriaux(); }, []);

  const openModal = (mat: Materiau | null) => {
    setEditingMat(mat);
    setFormData(mat ? { nom: mat.nom, type: mat.type, supplement_prix: mat.supplement_prix } : { nom: '', type: 'couleur', supplement_prix: 0 });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce matériau ?")) {
      try {
        await api.delete(`/materiaux/${id}`);
        fetchMateriaux();
      } catch (err) {
        console.error("Erreur de suppression", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMat) {
        await api.put(`/materiaux/${editingMat.id}`, formData);
      } else {
        await api.post('/materiaux', formData);
      }
      fetchMateriaux();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erreur", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Matériaux & Finitions</h1>
        <button onClick={() => openModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          + Ajouter
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-700 font-semibold">Nom</th>
              <th className="p-4 text-slate-700 font-semibold">Type</th>
              <th className="p-4 text-slate-700 font-semibold">Supplément Prix</th>
              <th className="p-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materiaux.map((mat) => (
              <tr key={mat.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{mat.nom}</td>
                <td className="p-4 text-slate-600 capitalize">{mat.type}</td>
                <td className="p-4 text-slate-900 font-semibold">{mat.supplement_prix} FCFA</td>
                <td className="p-4 space-x-3">
                  <button onClick={() => openModal(mat)} className="text-blue-600 hover:underline font-medium">Modifier</button>
                  <button onClick={() => handleDelete(mat.id)} className="text-red-600 hover:underline font-medium">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">{editingMat ? 'Modifier' : 'Ajouter'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 font-medium">Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 font-medium">Type</label>
                <select name="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900">
                  <option value="couleur">Couleur</option>
                  <option value="finition">Finition</option>
                  <option value="poignee">Poignée</option>
                  <option value="materiau">Matériau</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 font-medium">Supplément Prix (FCFA)</label>
                <input type="number" step="0.01" name="supplement_prix" value={formData.supplement_prix} onChange={(e) => setFormData({...formData, supplement_prix: +e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}