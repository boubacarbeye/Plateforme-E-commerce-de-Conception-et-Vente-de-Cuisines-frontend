import { useState, useEffect } from 'react';
import CatalogueModules from './components/CatalogueModules';
import ConfigurateurCanvas from './components/ConfigurateurCanvas';

function App() {
  const [pieceForme, setPieceForme] = useState('lineaire'); // 'lineaire' ou 'L'
  const [modulesPositionnes, setModulesPositionnes] = useState([]);
  const [messageErreur, setMessageErreur] = useState('');

  // Longueur maximale de la cuisine autorisée par la RG-02 (en cm)
  const MAX_LONGUEUR_CUISINE_CM = 400;

  // Auto-effacement du message d'erreur après 4 secondes
  useEffect(() => {
    if (messageErreur) {
      const timer = setTimeout(() => setMessageErreur(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageErreur]);

  /**
   * RECHERCHE ET RECALCUL DE L'ESPACE DISPONIBLE (RG-02 COEUR LOGIQUE)
   */
  const verifierEspaceDisponible = (nouvelleLargeurCm) => {
    const largeurTotaleOccupee = modulesPositionnes.reduce((acc, current) => {
      return acc + current.largeur_cm;
    }, 0);

    return (largeurTotaleOccupee + nouvelleLargeurCm) <= MAX_LONGUEUR_CUISINE_CM;
  };

  /**
   * Action 1 : L'utilisateur lâche un meuble via Drag & Drop
   */
  const handleDropModule = (nouveauModule) => {
    if (!verifierEspaceDisponible(nouveauModule.largeur_cm)) {
      setMessageErreur(`Action bloquee : La capacite maximale de la cuisine (${MAX_LONGUEUR_CUISINE_CM} cm) est atteinte.`);
      return;
    }

    const largeurTotaleActuelle = modulesPositionnes.reduce((acc, m) => acc + m.largeur_cm, 0);
    
    setModulesPositionnes([
      ...modulesPositionnes, 
      {
        ...nouveauModule,
        position_x: largeurTotaleActuelle
      }
    ]);
  };

  /**
   * Action 2 : L'utilisateur clique sur le bouton "+" du catalogue
   */
  const handleAjouterViaClic = (module) => {
    const largeurMeuble = parseInt(module.largeur_cm, 10);

    if (!verifierEspaceDisponible(largeurMeuble)) {
      setMessageErreur(`Espace restant insuffisant pour ajouter ce module de ${largeurMeuble} cm.`);
      return;
    }

    const largeurTotaleActuelle = modulesPositionnes.reduce((acc, m) => acc + m.largeur_cm, 0);

    const nouveauModule = {
      module_id: module.ModuleProduit_id || module.id,
      largeur_cm: largeurMeuble,
      position_x: largeurTotaleActuelle,
      position_y: 0
    };

    setModulesPositionnes([...modulesPositionnes, nouveauModule]);
  };

  /**
   * Action 3 : Déplacement manuel à la souris à l'intérieur du plan
   */
  const handleDeplacerModule = (index, nouvellesCoordonnees) => {
    const copie = [...modulesPositionnes];
    copie[index] = { ...copie[index], ...nouvellesCoordonnees };
    setModulesPositionnes(copie);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col m-0 p-0 w-full overflow-hidden">
      
      {/* Barre de Navigation Supérieure */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-lg font-bold tracking-wide text-white">Configurateur Spatial Studio</h1>
        </div>

        {/* Notification Système Intégrée en CSS Pur (Remplace l'alert) */}
        {messageErreur && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-red-950/90 border border-red-500/30 text-red-200 px-4 py-2 rounded-xl text-xs font-medium tracking-wide shadow-2xl backdrop-blur-md animate-fade-in-down flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {messageErreur}
          </div>
        )}

        {/* Sélecteur de forme de pièce */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setPieceForme('lineaire')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${pieceForme === 'lineaire' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            I Pièce Linéaire
          </button>
          <button 
            onClick={() => setPieceForme('L')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${pieceForme === 'L' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            L Pièce en L
          </button>
        </div>
      </header>

      {/* Espace de travail principal */}
      <div className="flex-1 flex w-full h-[calc(100vh-69px)] overflow-hidden">
        
        {/* Panneau Latéral Gauche : Catalogue */}
        <aside className="w-80 border-r border-slate-900 p-6 bg-slate-950/40 backdrop-blur-xl flex-shrink-0">
          <CatalogueModules onAjouterViaClic={handleAjouterViaClic} />
        </aside>

        {/* Zone de droite : Le Canvas interactif */}
        <main className="flex-1 bg-slate-950 p-6">
          <ConfigurateurCanvas 
            pieceForme={pieceForme}
            modulesPositionnes={modulesPositionnes}
            onDropModule={handleDropModule}
            onDeplacerModule={handleDeplacerModule}
          />
        </main>

      </div>
    </div>
  );
}

export default App;