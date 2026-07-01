import { useState } from 'react';

const API = 'http://127.0.0.1:8001/api';

const InscriptionClient = ({ onInscriptionSuccess, onAnnuler }) => {
    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [erreurs, setErreurs] = useState({});
    const [erreurGlobale, setErreurGlobale] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErreurs(prev => ({ ...prev, [e.target.name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreurGlobale('');
        setErreurs({});
        setLoading(true);

        try {
            const response = await fetch(`${API}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                    role: 'client',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErreurs(data.errors);
                } else {
                    setErreurGlobale(data.message || "Erreur lors de l'inscription.");
                }
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            onInscriptionSuccess(data.user, data.user.role);

        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setErreurGlobale('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    const champErreur = (champ) =>
        erreurs[champ] ? (
            <p className="text-[10px] text-red-400 mt-1 font-medium">
                {Array.isArray(erreurs[champ]) ? erreurs[champ][0] : erreurs[champ]}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                <div className="flex flex-col items-center mb-8">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mb-3"></span>
                    <h2 className="text-xl font-bold text-white tracking-wide">Créer un compte</h2>
                    <p className="text-xs text-slate-400 mt-1">Accédez au configurateur de cuisine</p>
                </div>

                {erreurGlobale && (
                    <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {erreurGlobale}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom</label>
                            <input
                                type="text" name="nom" required value={form.nom} onChange={handleChange}
                                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${erreurs.nom ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500'}`}
                                placeholder="Diallo"
                            />
                            {champErreur('nom')}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prénom</label>
                            <input
                                type="text" name="prenom" required value={form.prenom} onChange={handleChange}
                                className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${erreurs.prenom ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500'}`}
                                placeholder="Mamadou"
                            />
                            {champErreur('prenom')}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adresse Email</label>
                        <input
                            type="email" name="email" required value={form.email} onChange={handleChange}
                            className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${erreurs.email ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500'}`}
                            placeholder="nom@exemple.com"
                        />
                        {champErreur('email')}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
                        <input
                            type="password" name="password" required value={form.password} onChange={handleChange}
                            className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${erreurs.password ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500'}`}
                            placeholder="8 caractères minimum"
                        />
                        {champErreur('password')}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                        <input
                            type="password" name="password_confirmation" required value={form.password_confirmation} onChange={handleChange}
                            className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${erreurs.password_confirmation ? 'border-red-500/50' : 'border-slate-800 focus:border-emerald-500'}`}
                            placeholder="••••••••"
                        />
                        {champErreur('password_confirmation')}
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm py-3 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>}
                            {loading ? 'Création en cours...' : 'Créer mon compte'}
                        </button>
                        <button
                            type="button" onClick={onAnnuler}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-3 rounded-xl transition-all cursor-pointer"
                        >
                            Déjà un compte ? Se connecter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InscriptionClient;