import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001/api';

const CATEGORIES = {
  meuble_bas:     { label: 'Meuble Bas',      couleur: 'text-blue-400   bg-blue-950/40   border-blue-500/30'   },
  plan_travail:   { label: 'Plan de Travail', couleur: 'text-amber-400  bg-amber-950/40  border-amber-500/30'  },
  electromenager: { label: 'Électroménager',  couleur: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
  meuble_haut:    { label: 'Meuble Haut',     couleur: 'text-cyan-400   bg-cyan-950/40   border-cyan-500/30'   },
  evier:          { label: 'Évier',           couleur: 'text-teal-400   bg-teal-950/40   border-teal-500/30'   },
  colonne:        { label: 'Colonne',         couleur: 'text-orange-400 bg-orange-950/40 border-orange-500/30' },
  robinetterie:   { label: 'Robinetterie',    couleur: 'text-rose-400   bg-rose-950/40   border-rose-500/30'   },
};

const FALLBACK = {
  meuble_bas:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=70',
  plan_travail:   'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=120&q=70',
  electromenager: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=120&q=70',
  meuble_haut:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=70',
  evier:          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&q=70',
  colonne:        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=70',
  robinetterie:   'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&q=70',
};

const CatalogueModules = ({ onAjouterViaClic }) => {
  const [modules, setModules]        = useState([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
  const [filtreCategorie, setFiltre] = useState('tous');

  useEffect(() => {
    fetch(`${API}/modules`, { headers: { Accept: 'application/json' } })
      .then(res => { if (!res.ok) throw new Error('Erreur serveur'); return res.json(); })
      .then(data => { setModules(data.data ?? data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const modulesFiltres = filtreCategorie === 'tous'
    ? modules
    : modules.filter(m => m.categorie === filtreCategorie);

  const categoriesPresentes = ['tous', ...new Set(modules.map(m => m.categorie))];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
      <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Chargement...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center my-4">⚠️ {error}</div>
  );

  return (
    <div className="h-full flex flex-col gap-4">

      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">Catalogue</span>
        <h2 className="text-lg font-bold text-white mt-2">Modules Cuisine</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Cliquez sur + ou glissez sur le plan</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-1.5">
        {categoriesPresentes.map(cat => (
          <button key={cat} onClick={() => setFiltre(cat)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              filtreCategorie === cat
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
            }`}>
            {cat === 'tous' ? 'Tous' : (CATEGORIES[cat]?.label ?? cat)}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {modulesFiltres.map((module) => {
          const moduleId  = module.ModuleProduit_id;
          const moduleNom = module.ModuleProduit_nom ?? 'Module Standard';
          const cat       = CATEGORIES[module.categorie];
          const imgSrc    = module.image_url || FALLBACK[module.categorie] || FALLBACK.meuble_bas;

          return (
            <div
              key={moduleId}
              draggable
              onDragStart={(e) => {
                // CORRECTION : on passe toutes les données nécessaires au canvas
                e.dataTransfer.setData('module_id',  moduleId);
                e.dataTransfer.setData('largeur_cm', module.largeur_cm);
                e.dataTransfer.setData('image_url',  module.image_url || '');
                e.dataTransfer.setData('prix_base',  module.prix_base || 0);
                e.dataTransfer.setData('nom',        moduleNom);
                e.dataTransfer.setData('categorie',  module.categorie || '');
                e.dataTransfer.setData('categorie',  module.categorie || '');
              }}
              className="group bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex items-stretch transition-all duration-200 hover:border-slate-600 hover:bg-slate-900 cursor-grab active:cursor-grabbing shadow-sm"
            >
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0 bg-slate-950 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={moduleNom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = FALLBACK[module.categorie] ?? FALLBACK.meuble_bas; }}
                />
              </div>

              {/* Infos */}
              <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 truncate leading-tight group-hover:text-white">{moduleNom}</h4>
                  {cat && (
                    <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cat.couleur}`}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">{module.largeur_cm} cm</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span className="text-[11px] text-emerald-400 font-bold">{Number(module.prix_base).toLocaleString('fr-FR')} F</span>
                  </div>
                  <button
                    onClick={() => onAjouterViaClic(module)}
                    className="w-6 h-6 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 hover:border-emerald-500 text-slate-400 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center active:scale-90 cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>
          );
        })}

        {modulesFiltres.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-600">Aucun module dans cette catégorie.</div>
        )}
      </div>
    </div>
  );
};

export default CatalogueModules;