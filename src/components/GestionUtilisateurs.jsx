import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001/api';
const ROLES = ['client', 'commercial', 'admin'];

const BADGE_ROLE = {
    admin:      'bg-purple-950/50 border-purple-500/30 text-purple-400',
    commercial: 'bg-amber-950/50 border-amber-500/30 text-amber-400',
    client:     'bg-emerald-950/50 border-emerald-500/30 text-emerald-400',
};

const FORM_VIDE = { nom: '', prenom: '', email: '', password: '', password_confirmation: '', role: 'client' };

const GestionUtilisateurs = () => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [notification, setNotification] = useState({ text: '', type: '' });
    const [confirmSupp, setConfirmSupp]   = useState(null);
    const [showForm, setShowForm]         = useState(false);
    const [form, setForm]                 = useState(FORM_VIDE);
    const [erreurs, setErreurs]           = useState({});
    const [formLoading, setFormLoading]   = useState(false);

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

    // ── Ajout d'un utilisateur par l'admin ──────────────────────────────────
    const handleAjouter = async (e) => {
        e.preventDefault();
        setErreurs({});
        setFormLoading(true);

        try {
            const res  = await fetch(`${API}/register`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({
                    nom:                   form.nom,
                    prenom:                form.prenom,
                    email:                 form.email,
                    password:              form.password,
                    password_confirmation: form.password_confirmation,
                    role:                  form.role,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) { setErreurs(data.errors); return; }
                throw new Error(data.message || 'Erreur serveur.');
            }

            notifier('Utilisateur créé avec succès.');
            setForm(FORM_VIDE);
            setShowForm(false);
            chargerUtilisateurs();
        } catch (err) {
            notifier(err.message, 'red');
        } finally {
            setFormLoading(false);
        }
    };

    const champErreur = (champ) =>
        erreurs[champ] ? (
            <p className="text-[10px] text-red-400 mt-1">
                {Array.isArray(erreurs[champ]) ? erreurs[champ][0] : erreurs[champ]}
            </p>
        ) : null;

    // ── Changement de rôle ───────────────────────────────────────────────────
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
            notifier(err.message, 'red');
        }
    };

    // ── Suppression ──────────────────────────────────────────────────────────
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
            notifier(err.message, 'red');
        } finally {
            setConfirmSupp(null);
        }
    };

    return (
        <div className="space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Gestion des utilisateurs</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{utilisateurs.length} compte(s) enregistré(s)</p>
                </div>
                <div className="flex items-center gap-4">
                    {notification.text && (
                        <div className={`border px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${notification.type === 'emerald' ? 'bg-slate-900 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-red-500/30 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${notification.type === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {notification.text}
                        </div>
                    )}
                    <button
                        onClick={() => { setShowForm(v => !v); setErreurs({}); setForm(FORM_VIDE); }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                    >
                        {showForm ? 'Annuler' : '+ Ajouter un utilisateur'}
                    </button>
                </div>
            </div>

            {/* Formulaire d'ajout */}
            {showForm && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-3">
                        Nouveau compte utilisateur
                    </h3>
                    <form onSubmit={handleAjouter} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom</label>
                            <input type="text" required value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                placeholder="Diallo" />
                            {champErreur('nom')}
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prénom</label>
                            <input type="text" required value={form.prenom} onChange={e => setForm(p => ({...p, prenom: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                placeholder="Mamadou" />
                            {champErreur('prenom')}
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                placeholder="nom@exemple.com" />
                            {champErreur('email')}
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rôle</label>
                            <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
                                {ROLES.map(r => (
                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mot de passe</label>
                            <input type="password" required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                placeholder="8 caractères minimum" />
                            {champErreur('password')}
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirmer le mot de passe</label>
                            <input type="password" required value={form.password_confirmation} onChange={e => setForm(p => ({...p, password_confirmation: e.target.value}))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                placeholder="••••••••" />
                            {champErreur('password_confirmation')}
                        </div>

                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button type="submit" disabled={formLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-2">
                                {formLoading && <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>}
                                {formLoading ? 'Création...' : 'Créer le compte'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-white">{u.prenom} {u.nom}</p>
                                        <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{u.Utilisateur_id?.slice(0, 18)}…</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleChangerRole(u.Utilisateur_id, e.target.value)}
                                            className={`appearance-none pl-2.5 pr-6 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none bg-transparent ${BADGE_ROLE[u.role] ?? 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                        >
                                            {ROLES.map(r => (
                                                <option key={r} value={r} className="bg-slate-900 text-slate-200 normal-case font-normal text-xs">
                                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {confirmSupp === u.Utilisateur_id ? (
                                            <span className="flex items-center justify-end gap-3">
                                                <span className="text-slate-400 text-[11px]">Confirmer ?</span>
                                                <button onClick={() => handleSupprimer(u.Utilisateur_id)} className="text-red-400 hover:text-red-300 font-bold text-[11px] cursor-pointer">Oui</button>
                                                <button onClick={() => setConfirmSupp(null)} className="text-slate-400 hover:text-white font-medium text-[11px] cursor-pointer">Non</button>
                                            </span>
                                        ) : (
                                            <button onClick={() => setConfirmSupp(u.Utilisateur_id)} className="text-red-400 hover:text-red-300 font-medium cursor-pointer text-[11px]">
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {utilisateurs.length === 0 && (
                        <div className="text-center py-10 text-xs text-slate-600">Aucun utilisateur enregistré.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GestionUtilisateurs;