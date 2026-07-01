// src/app/configurateur/[id]/page.tsx
'use client';

import { useState, useEffect, use, Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Box, RoundedBox, useGLTF, Html, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import api from '@/lib/axios';
import Link from 'next/link';

interface ModuleCatalogue { id: string; nom: string; largeur_cm: number; prix_base: number; image_url: string; model_3d_url?: string; categorie: string; }
interface Materiau { id: string; nom: string; type: string; supplement_prix: number; code_hex?: string; }
interface PlacedModule { id: string; module_id: string; nom: string; largeur_cm: number; prix_base: number; image_url: string; model_3d_url?: string; categorie: string; position: [number, number, number]; rotation: [number, number, number]; materiau_id?: string; couleur_hex?: string; }

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.envMapIntensity = 1.2;
        }
      }
    });
    return c;
  }, [scene]);
  
  return <primitive object={cloned} scale={1} />;
}

function DoorMaterial({ url, color }: { url?: string; color?: string }) {
  const texture = useMemo(() => {
    if (!url || url.endsWith('.glb')) return null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    let tex = null;
    loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; tex = t; });
    return tex;
  }, [url]);

  if (texture) return <meshStandardMaterial map={texture} roughness={0.6} metalness={0.1} envMapIntensity={1} />;
  return <meshStandardMaterial color={color || "#ffffff"} roughness={0.5} metalness={0.1} envMapIntensity={1} />;
}

function KitchenModule({ mod, scale, roomSize, onMove, onSelect, isSelected, onDragStart, onDragEnd, prix }: any) {
  const modWidth = Math.max(0.1, mod.largeur_cm * scale);
  const modDepth = 0.6;
  const modHeight = 0.85;

  const isRotated = Math.abs((mod.rotation[1] % Math.PI)) > 0.1;
  const boundWidth = isRotated ? modDepth : modWidth;
  const boundDepth = isRotated ? modWidth : modDepth;

  const halfRoomX = (roomSize[0] * scale) / 2 - boundWidth / 2 - 0.01;
  const halfRoomZ = (roomSize[1] * scale) / 2 - boundDepth / 2 - 0.01;

  const offset = useRef({ x: 0, z: 0 });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect(mod.id);
    onDragStart();
    offset.current = { x: e.point.x - mod.position[0], z: e.point.z - mod.position[2] };
  };

  const handlePointerMove = (e: any) => {
    if (e.buttons === 1) {
      e.stopPropagation();
      let rawX = e.point.x - offset.current.x;
      let rawZ = e.point.z - offset.current.z;

      let snapX = Math.round(rawX / 0.05) * 0.05;
      let snapZ = Math.round(rawZ / 0.05) * 0.05;

      snapX = Math.max(-halfRoomX, Math.min(halfRoomX, snapX));
      snapZ = Math.max(-halfRoomZ, Math.min(halfRoomZ, snapZ));

      onMove(mod.id, snapX, snapZ);
    }
  };

  const isGlb = mod.model_3d_url && mod.model_3d_url.endsWith('.glb');

  return (
    <group 
      position={mod.position} 
      onPointerDown={handlePointerDown}
      onPointerUp={() => onDragEnd()}
      onPointerMove={handlePointerMove}
    >
      <group rotation={mod.rotation}>
        {isGlb ? (
          <Suspense fallback={<Box args={[modWidth, modHeight, modDepth]} position={[0, modHeight/2, 0]}><meshStandardMaterial color="gray" /></Box>}>
            <GlbModel url={mod.model_3d_url} />
          </Suspense>
        ) : (
          <>
            {/* Plinthe */}
            <Box args={[modWidth - 0.1, 0.15, modDepth - 0.1]} position={[0, 0.075, 0]} castShadow>
              <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
            </Box>
            {/* Corps */}
            <RoundedBox args={[modWidth, 0.65, modDepth]} radius={0.02} smoothness={4} position={[0, 0.475, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={mod.categorie === 'electromenager' ? '#1e293b' : '#ffffff'} roughness={0.7} metalness={0.1} envMapIntensity={1} />
            </RoundedBox>
            {/* Plan de travail (Bois clair style IKEA) */}
            <RoundedBox args={[modWidth + 0.03, 0.04, modDepth + 0.02]} radius={0.01} smoothness={4} position={[0, 0.82, 0]} castShadow>
              <meshStandardMaterial color="#d4a373" roughness={0.6} metalness={0.1} envMapIntensity={1} />
            </RoundedBox>
            {/* Porte */}
            <RoundedBox args={[modWidth * 0.92, 0.55, 0.02]} radius={0.01} smoothness={4} position={[0, 0.475, modDepth / 2 + 0.01]}>
              <DoorMaterial url={mod.image_url} color={mod.couleur_hex} />
            </RoundedBox>
            {/* Poignée */}
            <Box args={[0.15, 0.025, 0.03]} position={[modWidth * 0.35, 0.475, modDepth / 2 + 0.04]} castShadow>
              <meshStandardMaterial color="#9ca3af" metalness={1} roughness={0.3} envMapIntensity={2} />
            </Box>
          </>
        )}
      </group>

      <Html position={[0, 1.1, 0]} center distanceFactor={5} occlude>
        <div className={`bg-white px-3 py-1.5 rounded-lg shadow-xl border ${isSelected ? 'border-blue-500' : 'border-slate-200'} whitespace-nowrap pointer-events-none`}>
          <p className="text-xs font-bold text-slate-900">{mod.nom}</p>
          <p className="text-xs text-blue-600 font-medium">{prix} FCFA</p>
        </div>
      </Html>

      {isSelected && (
        <Box args={[boundWidth + 0.05, modHeight + 0.05, boundDepth + 0.05]} position={[0, modHeight/2, 0]}>
          <meshStandardMaterial color="#3b82f6" wireframe={true} />
        </Box>
      )}
    </group>
  );
}

export default function Configurateur3DPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [projet, setProjet] = useState<any>(null);
  const [catalogue, setCatalogue] = useState<ModuleCatalogue[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/projets/${id}`)
      .then(res => {
        setProjet(res.data);
        if (res.data.modules && Array.isArray(res.data.modules)) {
          const loadedModules = res.data.modules.map((pm: any) => ({
            id: pm.id,
            module_id: pm.module_id,
            nom: pm.module?.nom || 'Module',
            largeur_cm: pm.module?.largeur_cm || 60,
            prix_base: pm.module?.prix_base || 0,
            image_url: pm.module?.image_url || '',
            model_3d_url: pm.module?.model_3d_url || '',
            categorie: pm.module?.categorie || 'meuble_bas',
            position: [Number(pm.position_x) * 0.01, 0, Number(pm.position_y) * 0.01] as [number, number, number],
            rotation: [0, 0, 0],
            materiau_id: pm.materiau_id,
            couleur_hex: pm.materiau?.code_hex || '#ffffff'
          }));
          setPlacedModules(loadedModules);
        }
      })
      .catch(() => setError("Impossible de charger ce projet."));
      
    api.get('/modules').then(res => setCatalogue(Array.isArray(res.data) ? res.data : []));
    api.get('/materiaux').then(res => setMateriaux(Array.isArray(res.data) ? res.data : []));
  }, [id]);

  const addModule = (mod: ModuleCatalogue) => {
    const longueur = projet?.longueur_cm || 300;
    const largeur = projet?.largeur_cm || 300;
    const forme = projet?.forme || 'lineaire';
    const perimetreUtile = forme === 'lineaire' ? longueur : longueur + largeur;
    const totalLargeur = placedModules.reduce((sum, m) => sum + m.largeur_cm, 0);

    if (totalLargeur + mod.largeur_cm > perimetreUtile) {
      alert(`Espace insuffisant (RG-02) ! Il vous reste ${perimetreUtile - totalLargeur} cm.`);
      return;
    }

    const startZ = -((largeur * 0.01) / 2) + 0.3; 
    setPlacedModules([...placedModules, { 
      id: Date.now().toString(), module_id: mod.id, nom: mod.nom, largeur_cm: mod.largeur_cm, 
      prix_base: mod.prix_base, image_url: mod.image_url, model_3d_url: mod.model_3d_url, 
      categorie: mod.categorie, position: [0, 0, startZ], rotation: [0, 0, 0]
    }]);
    setIsSaved(false);
  };

  const handleMove = (id: string, x: number, z: number) => {
    setPlacedModules(mods => mods.map(m => m.id === id ? { ...m, position: [x, m.position[1], z] } : m));
    setIsSaved(false);
  };

  const handleRotate = (id: string) => {
    setPlacedModules(mods => mods.map(m => {
      if (m.id === id) {
        const newRotY = m.rotation[1] + Math.PI / 2;
        return { ...m, rotation: [0, newRotY, 0] };
      }
      return m;
    }));
    setIsSaved(false);
  };

  const applyMateriau = (mat: Materiau) => {
    if (!selectedModuleId) return;
    setPlacedModules(mods => mods.map(m => m.id === selectedModuleId ? { ...m, materiau_id: mat.id, couleur_hex: mat.code_hex } : m));
    setIsSaved(false);
  };

  const handleDelete = (id: string) => {
    setPlacedModules(mods => mods.filter(m => m.id !== id));
    setSelectedModuleId(null);
    setIsSaved(false);
  };

  const handleSave = async () => {
    const payload = { modules: placedModules.map(mod => ({ module_id: mod.module_id, materiau_id: mod.materiau_id, position_x: mod.position[0] / 0.01, position_y: mod.position[2] / 0.01, quantite: 1 })) };
    try {
      await api.put(`/projets/${id}`, payload);
      setIsSaved(true);
      alert("Projet sauvegardé avec succès !");
    } catch { alert("Erreur de sauvegarde. Êtes-vous connecté ?"); }
  };

  if (error) return <div className="h-screen flex items-center justify-center text-red-500 bg-slate-900 text-lg p-8 text-center">{error}</div>;
  if (!projet) return <div className="h-screen flex items-center justify-center text-slate-400 bg-slate-900 text-lg">Chargement du projet 3D...</div>;

  const forme = projet.forme || 'lineaire';
  const longueur = projet.longueur_cm || 300;
  const largeur = projet.largeur_cm || 300;
  const hauteur = projet.hauteur_cm || 250;
  const perimetreUtile = forme === 'lineaire' ? longueur : longueur + largeur;
  const totalLargeur = placedModules.reduce((sum, m) => sum + m.largeur_cm, 0);

  const estimation = placedModules.reduce((sum, m) => {
    let total = sum + Number(m.prix_base || 0);
    if (m.materiau_id) { const mat = materiaux.find(x => x.id === m.materiau_id); if (mat) total += Number(mat.supplement_prix); }
    return total;
  }, 0);

  const scale = 0.01;
  const selectedModule = placedModules.find(m => m.id === selectedModuleId);

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="h-20 bg-white text-slate-900 flex items-center justify-between px-8 z-20 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/catalogue" className="text-slate-400 hover:text-slate-900 transition">&larr; Retour</Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900" style={{fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'}}>Cuisine 3D Studio</h1>
            <p className="text-xs text-slate-500">{longueur} x {largeur} x {hauteur} cm</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className="block text-xs text-slate-500 uppercase tracking-widest">Espace utilisé</span>
            <span className="text-sm font-bold text-slate-700">{totalLargeur} / {perimetreUtile} cm</span>
          </div>
          <div className="text-right">
            <span className="block text-xs text-slate-500 uppercase tracking-widest">Estimation</span>
            <span className="text-2xl font-bold text-slate-900" style={{fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'}}>{Number(estimation).toLocaleString()} FCFA</span>
          </div>
          <button onClick={handleSave} className={`px-6 py-3 rounded-full font-semibold text-sm transition ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {isSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
          <Link href={`/projets/${id}/recapitulatif`} className="bg-slate-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-700 transition shadow-sm">Voir Devis →</Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <aside className="w-80 bg-white text-slate-900 p-6 overflow-y-auto z-10 border-r border-slate-200">
          <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6" style={{fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'}}>Catalogue</h2>
          <div className="space-y-3">
            {catalogue.map(mod => (
              <button key={mod.id} onClick={() => addModule(mod)} className="w-full flex items-center gap-4 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition text-left border border-transparent hover:border-slate-200 group">
                <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {mod.image_url && !mod.image_url.endsWith('.glb') ? (
                    <img src={mod.image_url} alt={mod.nom} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">{mod.nom}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{Number(mod.prix_base).toLocaleString()} FCFA</p>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 relative bg-slate-200">
          <Canvas 
            camera={{ position: [3, 3, 4], fov: 45 }} 
            shadows 
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            onPointerUp={() => setIsDragging(false)}
          >
            <color attach="background" args={['#ffffff']} />
            
            {/* Lumières très douces et blanches (Style IKEA) */}
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#ffffff" />

            {/* Environnement de Studio Virtuel */}
            <Environment resolution={256}>
              <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} color="#ffffff" />
              <Lightformer intensity={1.5} position={[-5, 2, -5]} scale={[10, 10, 1]} color="#ffffff" />
              <Lightformer intensity={1.5} position={[5, 2, 5]} scale={[10, 10, 1]} color="#ffffff" />
            </Environment>

            <OrbitControls enabled={!isDragging} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.1} enablePan={false} target={[0, 0.4, 0]} minDistance={2} maxDistance={6} />

            {/* Sol (Bois clair) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[longueur * scale, largeur * scale]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} metalness={0.1} envMapIntensity={0.5} />
            </mesh>

            <gridHelper args={[longueur * scale, longueur / 10, '#e2e8f0', '#f1f5f9']} position={[0, 0.001, 0]} />

            {/* Murs Blancs Opaques */}
            <Box args={[longueur * scale, hauteur * scale, 0.05]} position={[0, (hauteur * scale)/2, -(largeur * scale)/2]} receiveShadow>
              <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} side={THREE.DoubleSide} />
            </Box>
            <Box args={[0.05, hauteur * scale, largeur * scale]} position={[-(longueur * scale)/2, (hauteur * scale)/2, 0]} receiveShadow>
              <meshStandardMaterial color="#f8fafc" roughness={1} metalness={0} side={THREE.DoubleSide} />
            </Box>

            {/* Ombres très floutées sous les meubles */}
            <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={20} blur={3} far={5} />

            <Suspense fallback={null}>
              {placedModules.map(mod => (
                <KitchenModule 
                  key={mod.id} 
                  mod={mod} 
                  scale={scale} 
                  roomSize={[longueur, largeur]} 
                  onMove={handleMove} 
                  onSelect={setSelectedModuleId} 
                  isSelected={selectedModuleId === mod.id} 
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  prix={Number(mod.prix_base).toLocaleString()}
                />
              ))}
            </Suspense>
          </Canvas>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-slate-700 px-6 py-3 rounded-full text-xs flex gap-6 border border-slate-200 shadow-xl">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Clic gauche + glisser : Déplacer</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-slate-400 rounded-full"></span> Clic droit : Tourner</span>
          </div>
        </main>

        <aside className="w-80 bg-white text-slate-900 p-6 overflow-y-auto z-10 border-l border-slate-200">
          <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-6" style={{fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'}}>Personnalisation</h2>
          {!selectedModule ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <p className="text-sm text-slate-400">Cliquez sur un meuble dans la cuisine pour modifier ses couleurs, finitions, ou le supprimer.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="pb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-900" style={{fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'}}>{selectedModule.nom}</h4>
                <p className="text-xs text-slate-500 mt-1">Prix base : <span className="text-blue-600 font-medium">{Number(selectedModule.prix_base).toLocaleString()} FCFA</span></p>
              </div>
              
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Couleurs</h5>
                <div className="grid grid-cols-5 gap-4">
                  {materiaux.filter(m => m.type === 'couleur').map(mat => (
                    <button key={mat.id} onClick={() => applyMateriau(mat)} title={`${mat.nom} (+${mat.supplement_prix} FCFA)`}
                      className={`w-10 h-10 rounded-full border-2 transition ${selectedModule.materiau_id === mat.id ? 'border-blue-500 scale-110' : 'border-slate-200'}`}
                      style={{ backgroundColor: mat.code_hex || '#CCC' }} />
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Poignées</h5>
                <div className="space-y-3">
                  {materiaux.filter(m => m.type === 'poignee').map(mat => (
                    <button key={mat.id} onClick={() => applyMateriau(mat)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${selectedModule.materiau_id === mat.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                      {mat.nom} <span className="text-xs text-slate-400">(+{mat.supplement_prix} FCFA)</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button onClick={() => handleRotate(selectedModule.id)} className="w-full bg-slate-100 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl hover:bg-slate-200 transition font-semibold text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Pivoter de 90°
                </button>
                <button onClick={() => handleDelete(selectedModule.id)} className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl hover:bg-red-100 transition font-semibold text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Supprimer ce meuble
                </button>
              </div>

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}