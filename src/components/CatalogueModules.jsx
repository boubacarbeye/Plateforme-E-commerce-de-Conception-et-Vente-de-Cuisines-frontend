import React, { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001/api';

const CatalogueModules = ({ onAjouterViaClic }) => {
  const [modules, setModules] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Chargement du catalogue depuis l'API Laravel
 // Chargement du catalogue depuis l'API Laravel (CORRIGÉ)
  useEffect(() => {
    fetch(`${API}/modules`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors de la récupération des modules');
        return res.json();
      })
      .then((data) => {
        setModules(data);
        setChargement(false);
      })
      .catch((err) => {
        setErreur(err.message);
        setChargement(false);
      });
  }, []);

  // Gestion du Drag & Drop vers le configurateur 3D
  const handleDragStart = (e, mod) => {
    // Sécurisation des données transmises au configurateur 3D
    e.dataTransfer.setData('module_id', mod.ModuleProduit_id); // Votre clé primaire UUID
    e.dataTransfer.setData('nom', mod.ModuleProduit_nom);
    e.dataTransfer.setData('largeur_cm', mod.largeur_cm.toString());
    e.dataTransfer.setData('categorie', mod.categorie);
    e.dataTransfer.setData('prix_base', mod.prix_base.toString());
    e.dataTransfer.setData('image_url', mod.image_url || '');
    e.dataTransfer.setData('modele_3d_url', mod.modele_3d_url || ''); // Le lien vers le fichier .glb
  };

  if (chargement) return <div className="text-slate-400 text-xs p-4">Chargement du catalogue...</div>;
  if (erreur) return <div className="text-red-400 text-xs p-4">⚠️ Erreur: {erreur}</div>;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="border-b border-slate-900 pb-3">
        <h2 className="text-sm font-bold tracking-wider text-white uppercase">Catalogue Éléments</h2>
        <p className="text-slate-500 text-xs mt-0.5">Glissez ou cliquez pour ajouter à l'espace</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {modules.length === 0 ? (
          <p className="text-slate-500 text-xs italic p-2">Aucun module actif dans le catalogue.</p>
        ) : (
          modules.map((mod) => (
            <div
              key={mod.ModuleProduit_id} // Clé UUID unique
              draggable
              onDragStart={(e) => handleDragStart(e, mod)}
              onClick={() => onAjouterViaClic(mod)}
              className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800/80 rounded-xl p-3 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm"
            >
              {/* Box Image / Miniature informative */}
              <div className="w-14 h-14 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 border border-slate-900 flex items-center justify-center relative">
                {mod.image_url ? (
                  <img 
                    src={mod.image_url} 
                    alt={mod.ModuleProduit_nom} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      // Fallback si l'image serveur a un problème
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-slate-600 font-bold">3D ONLY</span>
                )}
                {/* Petit badge discret indiquant qu'un vrai modèle 3D est lié */}
                {mod.modele_3d_url && (
                  <span className="absolute bottom-0.5 right-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-extrabold px-1 rounded">3D</span>
                )}
              </div>

              {/* Métadonnées du meuble */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">{mod.ModuleProduit_nom}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{mod.categorie}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-900/60">{mod.largeur_cm} cm</span>
                  <span className="text-[11px] font-bold text-emerald-400 ml-auto">{parseFloat(mod.prix_base).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CatalogueModules;