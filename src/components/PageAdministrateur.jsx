import { useState, useEffect } from 'react';
import GestionUtilisateurs from './GestionUtilisateurs';

const API = 'http://127.0.0.1:8001/api';

const CATEGORIES = {
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
  image_url:         '',
};

const PageAdministrateur = ({ onDeconnexion }) => {
  const [onglet, setOnglet]             = useState('modules');
  const [modules, setModules]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState(FORM_VIDE);
  const [editionId, setEditionId]       = useState(null);
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [previewUrl, setPreviewUrl]     = useState('');

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
    } catch { notifier('Erreur de chargement.', 'red'); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'image_url') setPreviewUrl(value);
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
          ModuleProduit_nom: form.ModuleProduit_nom,
          categorie:         form.categorie,
          largeur_cm:        parseInt(form.largeur_cm, 10),
          prix_base:         parseFloat(form.prix_base),
          image_url:         form.image_url || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      notifier(editionId ? 'Module mis à jour.' : 'Module créé.');
      setForm(FORM_VIDE);
      setPreviewUrl('');
      setEditionId(null);
      chargerCatalogue();
    } catch (err) { notifier(err.message, 'red'); }
  };

  const handleEdit = (mod) => {
    setEditionId(mod.ModuleProduit_id);
    setForm({
      ModuleProduit_nom: mod.ModuleProduit_nom ?? '',
      categorie:         mod.categorie         ?? 'meuble_bas',
      largeur_cm:        mod.largeur_cm        ?? '',
      prix_base:         mod.prix_base         ?? '',
      image_url:         mod.image_url         ?? '',
    });
    setPreviewUrl(mod.image_url ?? '');
  };

  const handleDelete = async (id) => {
    if (!confirm('Désactiver ce module ?')) return;
    try {
      const res  = await fetch(`${API}/modules/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notifier('Module désactivé.');
      chargerCatalogue();
    } catch (err) { notifier(err.message, 'red'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Sidebar */}
      <div className="flex h-screen">
        <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4 border-b border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-white tracking-wide">Admin</span>
          </div>

          {[
            { id: 'modules',       label: 'Catalogue',      icon: '📦' },
            { id: 'utilisateurs',  label: 'Utilisateurs',   icon: '👥' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setOnglet(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-left ${
                onglet === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="mt-auto">
            {notification.text && (
              <div className={`mb-3 px-3 py-2 rounded-xl text-[10px] font-medium border flex items-center gap-2 ${
                notification.type === 'emerald'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-950/40 border-red-500/30 text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${notification.type === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                {notification.text}
              </div>
            )}
            <button
              onClick={onDeconnexion}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all text-left"
            >
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* ── ONGLET MODULES ── */}
          {onglet === 'modules' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Catalogue des modules</h1>
                <p className="text-xs text-slate-400 mt-1">{modules.length} produit(s) actif(s)</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Formulaire */}
                <div className="xl:col-span-1">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800">
                      <h2 className="text-sm font-bold text-white">
                        {editionId ? '✏️ Modifier le module' : '➕ Nouveau module'}
                      </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-4">

                      {/* Preview image */}
                      <div className="w-full h-36 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display='none'; }}
                          />
                        ) : (
                          <div className="text-center">
                            <p className="text-3xl mb-1">🖼️</p>
                            <p className="text-[10px] text-slate-600">Aperçu de l'image</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL de l'image</label>
                        <input
                          type="url" name="image_url" value={form.image_url} onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="https://exemple.com/image.jpg"
                        />
                        <p className="text-[10px] text-slate-600 mt-1">Collez l'URL d'une image produit</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Désignation</label>
                        <input
                          type="text" name="ModuleProduit_nom" required value={form.ModuleProduit_nom} onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="Ex: Meuble Bas 60cm Chêne"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
                        <select name="categorie" value={form.categorie} onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
                          {Object.entries(CATEGORIES).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Largeur (cm)</label>
                          <input type="number" name="largeur_cm" required min="1" value={form.largeur_cm} onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="60" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Prix (FCFA)</label>
                          <input type="number" name="prix_base" required min="0" value={form.prix_base} onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="120000" />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button type="submit"
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors">
                          {editionId ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                        {editionId && (
                          <button type="button"
                            onClick={() => { setEditionId(null); setForm(FORM_VIDE); setPreviewUrl(''); }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 rounded-xl cursor-pointer transition-colors">
                            Annuler
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Grille des modules */}
                <div className="xl:col-span-2">
                  {loading ? (
                    <div className="flex items-center gap-3 py-8 text-xs text-slate-500">
                      <span className="w-5 h-5 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></span>
                      Chargement...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {modules.map(mod => (
                        <div key={mod.ModuleProduit_id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group">
                          {/* Image */}
                          <div className="h-40 bg-slate-950 overflow-hidden relative">
                            {mod.image_url ? (
                              <img
                                src={mod.image_url}
                                alt={mod.ModuleProduit_nom}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🗄️</div>'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-5xl opacity-30">🗄️</span>
                              </div>
                            )}
                            {/* Badge catégorie */}
                            <div className="absolute top-2 left-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                {CATEGORIES[mod.categorie] ?? mod.categorie}
                              </span>
                            </div>
                          </div>

                          {/* Infos */}
                          <div className="p-4">
                            <h3 className="text-sm font-bold text-white truncate">{mod.ModuleProduit_nom}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <p className="text-xs text-slate-400">{mod.largeur_cm} cm</p>
                                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                                  {Number(mod.prix_base).toLocaleString('fr-FR')} FCFA
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(mod)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                                  Éditer
                                </button>
                                <button onClick={() => handleDelete(mod.ModuleProduit_id)}
                                  className="bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-red-900/30">
                                  Suppr.
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
            </div>
          )}

          {/* ── ONGLET UTILISATEURS ── */}
          {onglet === 'utilisateurs' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Gestion des utilisateurs</h1>
                <p className="text-xs text-slate-400 mt-1">Créez, modifiez les rôles et supprimez des comptes</p>
              </div>
              <GestionUtilisateurs />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PageAdministrateur;