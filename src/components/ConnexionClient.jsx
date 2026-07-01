import { useState } from 'react';

const ConnexionClient = ({ onLoginSuccess, onAnnuler, onInscription }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [erreur, setErreur]           = useState('');
    const [loading, setLoading]         = useState(false);

    const handleChange = (e) => {
        setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const text = await response.text();
            let data;
            try { data = JSON.parse(text); }
            catch { throw new Error('Format de réponse invalide.'); }

            if (!response.ok) throw new Error(data.message || 'Identifiants invalides.');

            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            onLoginSuccess(data.user, data.role);

        } catch (err) {
            setErreur(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                <div className="flex flex-col items-center mb-8">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mb-3"></span>
                    <h2 className="text-xl font-bold text-white tracking-wide">Plateforme E-commerce de Conception et Vente de Cuisines</h2>
                    <p className="text-xs text-slate-400 mt-1">Authentification sécurisée</p>
                </div>

                {erreur && (
                    <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {erreur}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
                        <input
                            type="email" name="email" required value={credentials.email} onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="nom@exemple.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                        <input
                            type="password" name="password" required value={credentials.password} onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>}
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        {/* Lien vers l'inscription */}
                        <button
                            type="button" onClick={onInscription}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-3 rounded-xl transition-all cursor-pointer"
                        >
                            Créer un compte
                        </button>

                        <button
                            type="button" onClick={onAnnuler}
                            className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer transition-colors text-center"
                        >
                            Continuer en tant que visiteur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConnexionClient;