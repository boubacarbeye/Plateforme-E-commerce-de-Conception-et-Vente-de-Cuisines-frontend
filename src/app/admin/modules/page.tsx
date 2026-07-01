// src/app/admin/modules/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Module {
  id: string;
  nom: string;
  categorie: string;
  largeur_cm: number;
  prix_base: number;
  image_url: string;
  actif: boolean;
}

const CATEGORIES = ['meuble_bas', 'meuble_haut', 'colonne', 'plan_travail', 'evier', 'robinetterie', 'electromenager'];

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules');
      setModules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  const openModal = (mod: Module | null) => {
    setEditingModule(mod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer/désactiver ce module ?")) {
      try {
        await api.delete(`/modules/${id}`);
        fetchModules(); // Rafraîchir la liste
      } catch (err) {
        console.error("Erreur de suppression", err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Modules</h1>
        <button 
          onClick={() => openModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Ajouter un module
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-700 font-semibold">Image</th>
              <th className="p-4 text-slate-700 font-semibold">Nom</th>
              <th className="p-4 text-slate-700 font-semibold">Catégorie</th>
              <th className="p-4 text-slate-700 font-semibold">Largeur</th>
              <th className="p-4 text-slate-700 font-semibold">Prix de base</th>
              <th className="p-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  {mod.image_url ? (
                    <img src={`http://127.0.0.1:8000${mod.image_url}`} alt={mod.nom} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">N/A</div>
                  )}
                </td>
                <td className="p-4 font-medium text-slate-900">{mod.nom}</td>
                <td className="p-4 text-slate-600 capitalize">{mod.categorie.replace('_', ' ')}</td>
                <td className="p-4 text-slate-600">{mod.largeur_cm} cm</td>
                <td className="p-4 font-semibold text-slate-900">{mod.prix_base} FCFA</td>
                <td className="p-4 space-x-3">
                  <button onClick={() => openModal(mod)} className="text-blue-600 hover:underline font-medium">Modifier</button>
                  <button onClick={() => handleDelete(mod.id)} className="text-red-600 hover:underline font-medium">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ModuleModal module={editingModule} onClose={() => setIsModalOpen(false)} onSuccess={fetchModules} />
      )}
    </div>
  );
}

function ModuleModal({ module, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    nom: module?.nom || '',
    categorie: module?.categorie || 'meuble_bas',
    largeur_cm: module?.largeur_cm || 60,
    prix_base: module?.prix_base || 0,
    image: null as File | null,
    model_3d: null as File | null // <-- AJOUT
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handle3DChange = (e: any) => {
    setFormData({ ...formData, model_3d: e.target.files[0] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value as any);
    });

    try {
      if (module) {
        payload.append('_method', 'PUT');
        await api.post(`/modules/${module.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/modules', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-96 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">{module ? 'Modifier' : 'Ajouter'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Nom</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Catégorie</label>
            <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-slate-900">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-700 font-medium">Largeur (cm)</label>
              <input type="number" name="largeur_cm" value={formData.largeur_cm} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-700 font-medium">Prix (FCFA)</label>
              <input type="number" step="0.01" name="prix_base" value={formData.prix_base} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
            </div>
          </div>
          
          {/* Image Catalogue */}
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Image Catalogue (PNG/JPG)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-slate-300 rounded text-slate-900" />
          </div>

          {/* Fichier 3D */}
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <label className="block text-sm mb-1 text-amber-800 font-medium">Modèle 3D (GLB) - Optionnel</label>
            <input type="file" accept=".glb" onChange={handle3DChange} className="w-full p-2 border border-amber-300 rounded text-slate-900" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}