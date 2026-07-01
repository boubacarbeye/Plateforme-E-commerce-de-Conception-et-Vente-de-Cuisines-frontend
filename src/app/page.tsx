import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center">
      <div className="absolute top-1/4 -right-20 z-0 h-[600px] w-[600px] rounded-full bg-amber-100/40 blur-[120px]"></div>
      <div className="absolute bottom-0 -left-20 z-0 h-[500px] w-[500px] rounded-full bg-stone-200/40 blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-20">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-[0.3em] mb-8">Configurateur 3D Nouvelle Génération</span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl text-stone-900 mb-8 leading-[1.1]">
          Concevez la cuisine <br /> de vos <span className="italic text-amber-700">rêves</span>.
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-stone-500 mb-12 font-light leading-relaxed">
          Importez vos dimensions, glissez-déposez vos meubles en 3D réelle, choisissez vos finitions et obtenez un devis instantanément.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/catalogue" className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-stone-900 text-white font-semibold rounded-full text-sm hover:bg-stone-700 transition tracking-wider uppercase">
            Concevoir ma cuisine
            <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
          <Link href="/login" className="px-10 py-4 text-stone-900 font-semibold rounded-full border border-stone-300 hover:bg-stone-50 transition text-sm tracking-wider uppercase">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}