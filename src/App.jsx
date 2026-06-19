import { useState, useEffect } from 'react';
import CatalogueModules from './components/CatalogueModules';
import ConfigurateurCanvas from './components/ConfigurateurCanvas';
import ConnexionClient from './components/ConnexionClient';
import InscriptionClient from './components/InscriptionClient';
import PageAdministrateur from './components/PageAdministrateur';

const API = 'http://127.0.0.1:8001/api';
const MAX_LONGUEUR_CUISINE_CM = 400;

function App() {
  const [user, setUser]                             = useState(null);
  const [role, setRole]                             = useState(null);
  // 'configurateur' | 'connexion' | 'inscription'
  const [vueCourante, setVueCourante]               = useState('configurateur');

  const [projetId, setProjetId]                     = useState(null);
  const [pieceForme, setPieceForme]                 = useState('lineaire');
  const [modulesPositionnes, setModulesPositionnes] = useState([]);
  const [messageErreur, setMessageErreur]           = useState('');
  const [messageType, setMessageType]               = useState('info');

  useEffect(() => {
    if (messageErreur) {
      const t = setTimeout(() => setMessageErreur(''), 4000);
      return () => clearTimeout(t);
    }
  }, [messageErreur]);

  const notifier = (texte, type = 'info') => {
    setMessageErreur(texte);
    setMessageType(type);
  };

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  // ─── CRUD PROJET ────────────────────────────────────────────────────────

  const handleCreerProjet = async () => {
    try {
      const res  = await fetch(`${API}/projets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          longueur_cm: MAX_LONGUEUR_CUISINE_CM,
          hauteur_cm:  250,
          forme:       pieceForme,
          largeur_cm:  pieceForme === 'en_L' ? 300 : null,
          statut:      'brouillon',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setProjetId(data.data?.ProjetCuisine_id);
      setModulesPositionnes([]);
      notifier('Nouveau projet initialisé.');
    } catch (err) {
      notifier(err.message, 'error');
    }
  };

  const handleModifierProjet = async () => {
    if (!projetId) return;
    try {
      const res  = await fetch(`${API}/projets/${projetId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ forme: pieceForme, largeur_cm: pieceForme === 'en_L' ? 300 : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      notifier('Configuration sauvegardée.');
    } catch (err) {
      notifier(err.message, 'error');
    }
  };

  const handleSupprimerProjet = async () => {
    if (!projetId || !confirm('Supprimer ce projet ?')) return;
    try {
      const res  = await fetch(`${API}/projets/${projetId}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProjetId(null);
      setModulesPositionnes([]);
      notifier('Projet supprimé.');
    } catch (err) {
      notifier(err.message, 'error');
    }
  };

  // ─── CANVAS ─────────────────────────────────────────────────────────────

  const largeurTotale = () => modulesPositionnes.reduce((acc, m) => acc + m.largeur_cm, 0);

  const verifierEspace = (larg) => largeurTotale() + larg <= MAX_LONGUEUR_CUISINE_CM;

  const handleDropModule = (mod) => {
    if (!verifierEspace(mod.largeur_cm)) {
      notifier(`Espace maximum (${MAX_LONGUEUR_CUISINE_CM} cm) atteint.`, 'error');
      return;
    }
    setModulesPositionnes(prev => [...prev, { ...mod, position_x: largeurTotale() }]);
  };

  const handleAjouterViaClic = (module) => {
    const larg = parseInt(module.largeur_cm, 10);
    if (!verifierEspace(larg)) {
      notifier('Espace insuffisant pour ce module.', 'error');
      return;
    }
    setModulesPositionnes(prev => [
      ...prev,
      { module_id: module.ModuleProduit_id, nom: module.ModuleProduit_nom, largeur_cm: larg, position_x: largeurTotale(), position_y: 0 },
    ]);
  };

  const handleDeplacerModule = (index, coords) => {
    setModulesPositionnes(prev => {
      const copie = [...prev];
      copie[index] = { ...copie[index], ...coords };
      return copie;
    });
  };

  // ─── AUTH ────────────────────────────────────────────────────────────────

  const handleLoginSuccess = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    setVueCourante('configurateur');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
    setProjetId(null);
    setModulesPositionnes([]);
  };

  // ─── RENDUS CONDITIONNELS ────────────────────────────────────────────────

  if (user && role === 'admin') {
    return <PageAdministrateur onDeconnexion={handleLogout} />;
  }

  if (vueCourante === 'connexion') {
    return (
      <ConnexionClient
        onLoginSuccess={handleLoginSuccess}
        onAnnuler={() => setVueCourante('configurateur')}
        onInscription={() => setVueCourante('inscription')}
      />
    );
  }

  if (vueCourante === 'inscription') {
    return (
      <InscriptionClient
        onInscriptionSuccess={handleLoginSuccess}
        onAnnuler={() => setVueCourante('connexion')}
      />
    );
  }

  // ─── VUE PRINCIPALE ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col m-0 p-0 w-full overflow-hidden">

      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-lg font-bold tracking-wide text-white">Configurateur Spatial</h1>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-6">
            {!projetId ? (
              <button onClick={handleCreerProjet} className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-transform active:scale-95">
                Initialiser un Projet
              </button>
            ) : (
              <>
                <button onClick={handleModifierProjet} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
                  Sauvegarder
                </button>
                <button onClick={handleSupprimerProjet} className="bg-slate-900 border border-red-900/30 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-950/20">
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Toast */}
        {messageErreur && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium tracking-wide shadow-2xl flex items-center gap-2 z-50">
            <span className={`w-1.5 h-1.5 rounded-full ${messageType === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            {messageErreur}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setPieceForme('lineaire')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${pieceForme === 'lineaire' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              I Linéaire
            </button>
            <button onClick={() => setPieceForme('en_L')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${pieceForme === 'en_L' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              L En L
            </button>
          </div>

          {!user ? (
            <button onClick={() => setVueCourante('connexion')} className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
              Espace Client / Pro
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{user.prenom} {user.nom}</span>
              <button onClick={handleLogout} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex w-full h-[calc(100vh-69px)] overflow-hidden">
        <aside className="w-80 border-r border-slate-900 p-6 bg-slate-950/40 backdrop-blur-xl flex-shrink-0">
          <CatalogueModules onAjouterViaClic={handleAjouterViaClic} />
        </aside>
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