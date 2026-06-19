import { useState, useEffect } from 'react';

const ICONES_CATEGORIE = {
  meuble_bas:     '🗄️',
  plan_travail:   '📐',
  electromenager: '🔌',
  meuble_haut:    '🗃️',
  evier:          '🚰',
  colonne:        '🏛️',
  robinetterie:   '🔧',
};

const CatalogueModules = ({ onAjouterViaClic }) => {
  const [modules, setModules]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/api/modules', {
      headers: { 'Accept': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur de communication avec le serveur');
        return res.json();
      })
      .then(data => {
        // L'API corrigée renvoie { status, data: [...] }
        setModules(data.data ?? data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center backdrop-blur-md my-4">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-6">

        {/* En-tête */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Composants
          </span>
          <h2 className="text-xl font-bold text-white mt-3 tracking-wide">
            Modules Disponibles
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Glissez un élément sur le plan ou utilisez le bouton d'ajout rapide.
          </p>
        </div>

        {/* Liste des modules */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-230px)] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {modules.map((module) => {
            // CORRECTION 6 : lecture du bon nom de colonne
            const moduleId  = module.ModuleProduit_id;
            const moduleNom = module.ModuleProduit_nom ?? 'Module Standard';
            const icone     = ICONES_CATEGORIE[module.categorie] ?? '🗄️';

            return (
              <div
                key={moduleId}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('module_id',  moduleId);
                  e.dataTransfer.setData('largeur_cm', module.largeur_cm);
                }}
                className="group relative bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/60 cursor-grab active:cursor-grabbing"
              >
                {/* Miniature */}
                <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800 text-2xl shadow-inner group-hover:scale-105 group-hover:border-slate-700 transition-all duration-200 select-none">
                  {icone}
                </div>

                {/* Données */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 truncate tracking-wide group-hover:text-white transition-colors">
                    {moduleNom}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-medium">{module.largeur_cm} cm</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    {/* CORRECTION 6 : prix_base et non prix_fcfa */}
                    <span className="text-xs text-emerald-400 font-bold">
                      {Number(module.prix_base).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Bouton ajout rapide */}
                <button
                  onClick={() => onAjouterViaClic(module)}
                  title="Ajouter au plan de travail"
                  className="h-8 w-8 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 hover:border-emerald-500 text-sm font-bold text-slate-400 rounded-lg transition-all duration-200 flex items-center justify-center active:scale-90 cursor-pointer shadow-sm"
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CatalogueModules;