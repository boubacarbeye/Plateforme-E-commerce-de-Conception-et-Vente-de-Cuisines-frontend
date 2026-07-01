// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors du changement de rôle.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  if (loading) return <div className="text-slate-500">Chargement des utilisateurs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900" style={{fontFamily: 'ui-serif, Georgia, serif'}}>Gestion des Utilisateurs</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 font-medium">
          + Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-700 font-semibold">Nom complet</th>
              <th className="p-4 text-slate-700 font-semibold">Email</th>
              <th className="p-4 text-slate-700 font-semibold">Rôle</th>
              <th className="p-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{user.prenom} {user.nom}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="client">Client</option>
                    <option value="commercial">Commercial</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline font-medium">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />
      )}
    </div>
  );
}

function UserModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', password: '', role: 'client' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erreur lors de la création de l'utilisateur. L'email est peut-être déjà utilisé.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Nouvel Utilisateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-700 font-medium">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-700 font-medium">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Email</label>
            <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700 font-medium">Rôle</label>
            <select name="role" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-slate-300 rounded text-slate-900">
              <option value="client">Client</option>
              <option value="commercial">Commercial</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 font-medium">Créer</button>
          </div>
        </form>
      </div>
    </div>
  );
}