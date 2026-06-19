import { useState, useEffect } from 'react';
import GestionUtilisateurs from './GestionUtilisateurs';

const API = 'http://127.0.0.1:8001/api';

const LIBELLES_CATEGORIES = {
    meuble_bas:     'Meuble Bas',
    plan_travail:   'Plan de Travail',
    electromenager: 'Électroménager',
    meuble_haut:    'Meuble Haut',
    evier:          'Évier',
    colonne:        'Colonne',
    robinetterie:   'Robinetterie',
};

const FORM_VIDE = {
    ModuleProduit_nom: '',
    categorie:         'meuble_bas',
    largeur_cm:        '',
    prix_base:         '',
};

const PageAdministrateur = ({ onDeconnexion }) => {
    const [onglet, setOnglet]               = useState('modules'); // 'modules' | 'utilisateurs'
    const [modules, setModules]             = useState([]);
    const [loading, setLoading]             = useState(true);
    const [formModule, setFormModule]       = useState(FORM_VIDE);
    const [editionId, setEditionId]         = useState(null);
    const [notification, setNotification]   = useState({ text: '', type: '' });

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

    useEffect(() => { chargerCatalogue(); }, []);

    const chargerCatalogue = async () => {
        try {
            const res  = await fetch(`${API}/modules`, { headers: { Accept: 'application/json' } });
            const data = await res.json();
            setModules(data.data ?? data);
        } catch {
            notifier('Erreur lors du chargement du catalogue.', 'red');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormModule(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url    = editionId ? `${API}/modules/${editionId}` : `${API}/modules`;
        const method = editionId ? 'PUT' : 'POST';

        try {
            const res  = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify({
                    ModuleProduit_nom: formModule.ModuleProduit_nom,
                    categorie:         formModule.categorie,
                    largeur_cm:        parseInt(formModule.largeur_cm, 10),
                    prix_base:         parseFloat(formModule.prix_base),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erreur serveur');

            notifier(editionId ? 'Module mis à jour.' : 'Nouveau module créé.');
            setFormModule(FORM_VIDE);
            setEditionId(null);
            chargerCatalogue();
        } catch (err) {
            notifier(err.message, 'red');
        }
    };

    const handleEdit = (mod) => {
        setEditionId(mod.ModuleProduit_id);
        setFormModule({
            ModuleProduit_nom: mod.ModuleProduit_nom ?? '',
            categorie:         mod.categorie         ?? 'meuble_bas',
            largeur_cm:        mod.largeur_cm        ?? '',
            prix_base:         mod.prix_base         ?? '',
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Désactiver ce module ?')) return;
        try {
            const res  = await fetch(`${API}/modules/${id}`, { method: 'DELETE', headers: authHeaders() });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            notifier('Module désactivé.');
            chargerCatalogue();
        } catch (err) {
            notifier(err.message, 'red');
        }
    };

    const annulerEdition = () => { setEditionId(null); setFormModule(FORM_VIDE); };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">

            {/* En-tête */}
            <div className="border-b border-slate-900 pb-6 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-wide text-white">Console Administration</h1>
                    <p className="text-xs text-slate-400 mt-1">Gestion des modules et des utilisateurs</p>
                </div>
                <div className="flex items-center gap-4">
                    {notification.text && (
                        <div className={`bg-slate-900 border px-4 py-2 rounded-xl text-xs font-medium tracking-wide flex items-center gap-2 ${notification.type === 'emerald' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${notification.type === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {notification.text}
                        </div>
                    )}
                    <button onClick={onDeconnexion} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setOnglet('modules')}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${onglet === 'modules' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Catalogue modules
                </button>
                <button
                    onClick={() => setOnglet('utilisateurs')}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${onglet === 'utilisateurs' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Utilisateurs
                </button>
            </div>

            {/* Onglet Modules */}
            {onglet === 'modules' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Formulaire */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 mb-4">
                            {editionId ? 'Modification du module' : 'Ajouter un module'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Désignation</label>
                                <input type="text" name="ModuleProduit_nom" required value={formModule.ModuleProduit_nom} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                    placeholder="Ex: Évier Inox 2 Bacs" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
                                <select name="categorie" value={formModule.categorie} onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
                                    {Object.entries(LIBELLES_CATEGORIES).map(([val, label]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Largeur (cm)</label>
                                    <input type="number" name="largeur_cm" required min="1" value={formModule.largeur_cm} onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                        placeholder="60" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prix (FCFA)</label>
                                    <input type="number" name="prix_base" required min="0" value={formModule.prix_base} onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                        placeholder="120000" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors">
                                    {editionId ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                                {editionId && (
                                    <button type="button" onClick={annulerEdition} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 rounded-xl cursor-pointer transition-colors">
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table modules */}
                    <div className="lg:col-span-2">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Catalogue actif</h2>
                        {loading ? (
                            <p className="text-xs text-slate-500">Synchronisation...</p>
                        ) : (
                            <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/30">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-900 bg-slate-900/60 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                            <th className="px-6 py-4">Désignation</th>
                                            <th className="px-6 py-4">Catégorie</th>
                                            <th className="px-6 py-4">Dim.</th>
                                            <th className="px-6 py-4">Prix</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900 text-xs">
                                        {modules.map((mod) => (
                                            <tr key={mod.ModuleProduit_id} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-white">{mod.ModuleProduit_nom ?? '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-300">
                                                        {LIBELLES_CATEGORIES[mod.categorie] ?? mod.categorie}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{mod.largeur_cm} cm</td>
                                                <td className="px-6 py-4 text-emerald-400 font-medium">
                                                    {Number(mod.prix_base).toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <button onClick={() => handleEdit(mod)} className="text-slate-400 hover:text-white font-medium cursor-pointer text-[11px]">Éditer</button>
                                                    <button onClick={() => handleDelete(mod.ModuleProduit_id)} className="text-red-400 hover:text-red-300 font-medium cursor-pointer text-[11px]">Désactiver</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Onglet Utilisateurs */}
            {onglet === 'utilisateurs' && <GestionUtilisateurs />}
        </div>
    );
};

export default PageAdministrateur;