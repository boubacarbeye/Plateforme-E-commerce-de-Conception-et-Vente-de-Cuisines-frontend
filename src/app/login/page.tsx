'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('admin@dgs.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isLogin) {
        res = await api.post('/auth/login', { email, password });
      } else {
        res = await api.post('/auth/register', { nom, prenom, email, password });
      }
      const { access_token, user } = res.data;
      setAuth(access_token, user);
      if (user.role === 'admin' || user.role === 'commercial') {
        window.location.href = '/admin/modules';
      } else {
        window.location.href = '/catalogue';
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data) {
        const firstError = Object.values(err.response.data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : "Erreur de validation.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(isLogin ? 'Email ou mot de passe incorrect.' : 'Erreur lors de l\'inscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="flex flex-col justify-center p-16 text-white relative z-10">
          <h1 className="text-6xl font-bold mb-4 tracking-tight" style={{fontFamily: 'Playfair Display, serif'}}>DGS Africa</h1>
          <p className="text-2xl text-stone-300 font-light mb-12">Plateforme de conception de cuisines 3D</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <p className="text-lg">Configurez votre cuisine en 3D avec un glisser-déposer fluide.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <p className="text-lg">Choisissez vos matériaux, couleurs et finitions en temps réel.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <p className="text-lg">Obtenez une estimation instantanée et générez votre devis PDF.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-12">
            <h1 className="text-4xl font-bold text-stone-900" style={{fontFamily: 'Playfair Display, serif'}}>DGS Africa</h1>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-stone-900" style={{fontFamily: 'Playfair Display, serif'}}>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
            <p className="text-stone-500 mt-2">{isLogin ? 'Accédez à votre espace et sauvegardez vos projets.' : 'Inscrivez-vous pour générer vos devis et sauvegarder vos plans.'}</p>
          </div>
          {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm"><p className="font-medium text-sm">{error}</p></div>}
          <div className="flex border-b border-stone-200 mb-8">
            <button onClick={() => { setIsLogin(true); setError(''); }} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${isLogin ? 'border-amber-700 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>Connexion</button>
            <button onClick={() => { setIsLogin(false); setError(''); }} className={`pb-3 px-4 font-medium text-sm transition border-b-2 ${!isLogin ? 'border-amber-700 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>Inscription</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prénom</label>
                  <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:bg-white transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nom</label>
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:bg-white transition" required />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Adresse Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:bg-white transition" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:ring-2 focus:ring-amber-700 focus:border-amber-700 focus:bg-white transition" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-700 text-white font-bold py-3 rounded-lg shadow-lg transition duration-200 disabled:opacity-50 flex justify-center items-center mt-2">
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}