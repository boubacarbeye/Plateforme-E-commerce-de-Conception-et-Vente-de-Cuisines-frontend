import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001/api';

const ROLES = ['client', 'commercial', 'admin'];

const BADGE_ROLE = {
    admin:      'bg-purple-950/50 border-purple-500/30 text-purple-400',
    commercial: 'bg-amber-950/50 border-amber-500/30 text-amber-400',
    client:     'bg-emerald-950/50 border-emerald-500/30 text-emerald-400',
};

const GestionUtilisateurs = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [notification, setNotification] = useState({ text: '', type: '' });
    const [confirmSupp, setConfirmSupp]   = useState(null); // id à confirmer

    const token = () => localStorage.getItem('token');

    const authHeaders = () => ({
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Authorization': `Bearer ${token()}`,
    });

    const notifier = (text, type = 'emerald') => {
        setNotification({ text, type });
        setTimeout(() => setNotification({ text: '', type: '' }), 4000);
    };

    const chargerUtilisateurs = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/admin/utilisateurs`, { headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setUtilisateurs(data.data ?? data);
        } catch (err) {
            notifier(err.message || 'Erreur de chargement.', 'red');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { chargerUtilisateurs(); }, []);

    const handleChangerRole = async (userId, nouveauRole) => {
        try {
            const res  = await fetch(`${API}/admin/utilisateurs/${userId}/role`, {
                method:  'PATCH',
                headers: authHeaders(),
                body:    JSON.stringify({ role: nouveauRole }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUtilisateurs(prev =>
                prev.map(u => u.Utilisateur_id === userId ? { ...u, role: nouveauRole } : u)
            );
            notifier('Rôle mis à jour.');
        } catch (err) {
            notifier(err.message || 'Erreur lors du changement de rôle.', 'red');
        }
    };

    const handleSupprimer = async (userId) => {
        try {
            const res  = await fetch(`${API}/admin/utilisateurs/${userId}`, {
                method:  'DELETE',
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUtilisateurs(prev => prev.filter(u => u.Utilisateur_id !== userId));
            notifier('Utilisateur supprimé.');
        } catch (err) {
            notifier(err.message || 'Erreur lors de la suppression.', 'red');
        } finally {
            setConfirmSupp(null);
        }
    };

    return (
        <div className="space-y-4">

            {/* En-tête section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Gestion des utilisateurs
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">{utilisateurs.length} compte(s) enregistré(s)</p>
                </div>

                {notification.text && (
                    <div className={`border px-4 py-2 rounded-xl text-xs font-medium tracking-wide flex items-center gap-2 ${notification.type === 'emerald' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-red-500/30 text-red-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${notification.type === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {notification.text}
                    </div>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center gap-3 py-8 text-xs text-slate-500">
                    <span className="w-4 h-4 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></span>
                    Chargement des comptes...
                </div>
            ) : (
                <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/30">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                <th className="px-6 py-4">Identité</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Rôle</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-xs">
                            {utilisateurs.map((u) => (
                                <tr key={u.Utilisateur_id} className="hover:bg-slate-900/40 transition-colors">

                                    {/* Identité */}
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white">{u.prenom} {u.nom}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono truncate max-w-[140px]">{u.Utilisateur_id}</p>
                                    </td>

                                    {/* Email */}
                                    <td className="px-6 py-4 text-slate-300">{u.email}</td>

                                    {/* Rôle — select inline */}
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleChangerRole(u.Utilisateur_id, e.target.value)}
                                                className={`appearance-none pl-2.5 pr-6 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${BADGE_ROLE[u.role] ?? 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                                style={{ background: 'transparent' }}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r} className="bg-slate-900 text-slate-200 normal-case font-normal text-xs">
                                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        {confirmSupp === u.Utilisateur_id ? (
                                            <span className="flex items-center justify-end gap-3">
                                                <span className="text-slate-400 text-[11px]">Confirmer ?</span>
                                                <button
                                                    onClick={() => handleSupprimer(u.Utilisateur_id)}
                                                    className="text-red-400 hover:text-red-300 font-bold text-[11px] cursor-pointer"
                                                >
                                                    Oui
                                                </button>
                                                <button
                                                    onClick={() => setConfirmSupp(null)}
                                                    className="text-slate-400 hover:text-white font-medium text-[11px] cursor-pointer"
                                                >
                                                    Non
                                                </button>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmSupp(u.Utilisateur_id)}
                                                className="text-red-400 hover:text-red-300 font-medium cursor-pointer transition-colors text-[11px]"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {utilisateurs.length === 0 && (
                        <div className="text-center py-10 text-xs text-slate-600">
                            Aucun utilisateur enregistré.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GestionUtilisateurs;