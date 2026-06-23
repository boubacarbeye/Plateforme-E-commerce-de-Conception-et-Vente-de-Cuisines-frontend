import React, { useState, Suspense, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Box, ContactShadows, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

const MAX_LARGEUR_CM = 400;
const MAX_HAUTEUR_CM = 300;
const PROFONDEUR_CM  = 60;
const HAUTEUR_BASE   = 90;
const MUR_EP         = 14;

// Chargeur de modèle GLB dynamique
const ModeleDynamique = ({ url, largeur, profondeur, hauteur }) => {
  const { scene } = useGLTF(url);
  const sceneClone = useMemo(() => {
    const clone = scene.clone(true);
    // Calcule la boîte englobante pour redimensionner le modèle
    const box  = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Mise à l'échelle pour correspondre aux dimensions réelles
    if (size.x > 0 && size.y > 0 && size.z > 0) {
      const scaleX = largeur   / size.x;
      const scaleY = hauteur   / size.y;
      const scaleZ = profondeur / size.z;
      clone.scale.set(scaleX, scaleY, scaleZ);
      // Recentre le modèle
      const newBox = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      newBox.getCenter(center);
      clone.position.set(-center.x, -newBox.min.y, -center.z);
    }
    return clone;
  }, [scene, largeur, profondeur, hauteur]);

  return <primitive object={sceneClone} />;
};

// Fallback pendant le chargement
const ModuleChargement = ({ largeur, profondeur, hauteur }) => (
  <group>
    <Box args={[largeur, hauteur, profondeur]} position={[0, hauteur / 2, 0]}>
      <meshStandardMaterial color="#1e3a5f" wireframe opacity={0.5} transparent />
    </Box>
    <Html center position={[0, hauteur / 2, 0]}>
      <div className="bg-slate-900/90 text-emerald-400 text-[9px] font-bold px-2 py-1 rounded-lg border border-emerald-500/30 whitespace-nowrap">
        Chargement...
      </div>
    </Html>
  </group>
);

// Couleurs par catégorie
const COULEURS_CAT = {
  meuble_bas:     '#1e3a5f',
  plan_travail:   '#3b2a1a',
  electromenager: '#2d1b4e',
  meuble_haut:    '#1a3a2a',
  evier:          '#1a2e3a',
  colonne:        '#3a1a1a',
  robinetterie:   '#1a2a1a',
  default:        '#1e293b',
};

const BORDURES_CAT = {
  meuble_bas:     '#3b82f6',
  plan_travail:   '#d97706',
  electromenager: '#8b5cf6',
  meuble_haut:    '#10b981',
  evier:          '#06b6d4',
  colonne:        '#ef4444',
  robinetterie:   '#22c55e',
  default:        '#64748b',
};

// Module 3D individuel
const Module3D = ({ mod, index, setDraggingIdx, isDragging, pieceForme }) => {
  const W = mod.largeur_cm;
  const D = PROFONDEUR_CM;
  const H = HAUTEUR_BASE;
  const estMurB = mod.rotation === 90;

  // Position selon mur
  const posX = estMurB ? D / 2 : mod.position_x + W / 2;
  const posZ = estMurB ? mod.position_y + W / 2 : D / 2;
  const rotY = estMurB ? Math.PI / 2 : 0;

  const couleur  = COULEURS_CAT[mod.categorie]  ?? COULEURS_CAT.default;
  const bordure  = BORDURES_CAT[mod.categorie] ?? BORDURES_CAT.default;

  return (
    <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>

      {/* Corps du meuble */}
      {mod.modele_3d_url ? (
        <Suspense fallback={<ModuleChargement largeur={W} profondeur={D} hauteur={H} />}>
          <ModeleDynamique
            url={mod.modele_3d_url}
            largeur={W} profondeur={D} hauteur={H}
          />
        </Suspense>
      ) : (
        // Fallback visuel si pas de modèle 3D
        <group>
          {/* Corps principal */}
          <Box args={[W, H, D]} position={[0, H / 2, 0]}>
            <meshStandardMaterial color={couleur} roughness={0.6} metalness={0.1} />
          </Box>
          {/* Façade avant */}
          <Box args={[W - 4, H - 8, 2]} position={[0, H / 2, D / 2 + 1]}>
            <meshStandardMaterial color={bordure} roughness={0.4} metalness={0.2} opacity={0.8} transparent />
          </Box>
          {/* Poignée */}
          {W >= 40 && (
            <Box args={[W * 0.4, 3, 3]} position={[0, H * 0.6, D / 2 + 3]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </Box>
          )}
          {/* Plan de travail */}
          <Box args={[W + 2, 3, D + 2]} position={[0, H + 1.5, 0]}>
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
          </Box>
        </group>
      )}

      {/* Étiquette nom */}
      <Html
        position={[0, H + 12, 0]}
        center
        occlude
        style={{ pointerEvents: 'none' }}
      >
        <div className="bg-slate-900/95 border border-slate-700 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
          {mod.nom || 'Module'} — {mod.largeur_cm}cm
        </div>
      </Html>

      {/* Hitbox invisible pour drag */}
      <mesh
        position={[0, H / 2, 0]}
        onPointerDown={(e) => { e.stopPropagation(); setDraggingIdx(index); document.body.style.cursor = 'grabbing'; }}
        onPointerOver={(e) => { e.stopPropagation(); if (!isDragging) document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { if (!isDragging) document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[W, H, D]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Contour de sélection */}
      {isDragging && (
        <lineSegments position={[0, H / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(W + 2, H + 2, D + 2)]} />
          <lineBasicMaterial color="#10b981" />
        </lineSegments>
      )}
    </group>
  );
};

// Scène principale
const Configurateur3D = ({ pieceForme, modulesPositionnes, onDeplacerModule, onDropModule }) => {
  const [draggingIdx, setDraggingIdx] = useState(null);

  const handlePointerMove = (e) => {
    if (draggingIdx === null) return;
    const pt  = e.point;
    const mod = modulesPositionnes[draggingIdx];
    const W   = mod.largeur_cm;

    // Détecte si proche du mur B (gauche) en mode en_L
    const distMurB = Math.abs(pt.x);
    const distMurA = Math.abs(pt.z);

    if (pieceForme === 'en_L' && distMurB < distMurA && pt.x < PROFONDEUR_CM * 2) {
      // Colle au mur B (gauche)
      onDeplacerModule(draggingIdx, {
        position_x: 0,
        position_y: Math.max(0, Math.min(MAX_HAUTEUR_CM - W, pt.z - W / 2)),
        rotation: 90,
      });
    } else {
      // Colle au mur A (fond)
      onDeplacerModule(draggingIdx, {
        position_x: Math.max(0, Math.min(MAX_LARGEUR_CM - W, pt.x - W / 2)),
        position_y: 0,
        rotation: 0,
      });
    }
  };

  const handlePointerUp = () => {
    if (draggingIdx !== null) {
      setDraggingIdx(null);
      document.body.style.cursor = 'default';
    }
  };

  const handleHTMLDrop = (e) => {
    e.preventDefault();
    const moduleId    = e.dataTransfer.getData('module_id');
    const largeurCm   = parseInt(e.dataTransfer.getData('largeur_cm'), 10);
    const nom         = e.dataTransfer.getData('nom');
    const categorie   = e.dataTransfer.getData('categorie');
    const prixBase    = parseFloat(e.dataTransfer.getData('prix_base') || 0);
    const imageUrl    = e.dataTransfer.getData('image_url');
    const modele3dUrl = e.dataTransfer.getData('modele_3d_url');
    if (!moduleId) return;

    onDropModule({
      module_id:     moduleId,
      largeur_cm:    largeurCm,
      image_url:     imageUrl,
      modele_3d_url: modele3dUrl,
      prix_base:     prixBase,
      nom, categorie,
      rotation:   0,
      position_x: Math.max(0, MAX_LARGEUR_CM / 2 - largeurCm / 2),
      position_y: 0,
    });
  };

  const prixTotal    = modulesPositionnes.reduce((acc, m) => acc + (parseFloat(m.prix_base) || 0), 0);
  const espaceOccupe = modulesPositionnes.reduce((acc, m) => acc + m.largeur_cm, 0);

  return (
    <div
      className="relative w-full h-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleHTMLDrop}
    >
      {/* Panneau info */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/95 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-xl pointer-events-none min-w-[220px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Cuisine 3D Studio</h3>
        </div>
        <p className="text-slate-300 text-sm font-semibold mb-3">{modulesPositionnes.length} élément(s) posé(s)</p>
        {prixTotal > 0 && (
          <p className="text-emerald-400 font-bold text-sm mb-3">{prixTotal.toLocaleString('fr-FR')} FCFA</p>
        )}
        <div className="text-slate-500 text-[10px] space-y-1 border-t border-slate-800 pt-2">
          <p>🖱️ <span className="text-slate-400">Clic gauche :</span> Tourner la vue</p>
          <p>🖱️ <span className="text-slate-400">Clic droit :</span> Déplacer la vue</p>
          <p>⚙️ <span className="text-slate-400">Glisser un meuble :</span> Le bouger</p>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{ position: [MAX_LARGEUR_CM / 2, 220, 420], fov: 45 }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[150, 350, 250]} intensity={1.2} />
          <pointLight position={[MAX_LARGEUR_CM / 2, 200, MAX_HAUTEUR_CM / 2]} intensity={0.3} color="#ffffff" />

          <OrbitControls
            makeDefault
            enabled={draggingIdx === null}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={100}
            maxDistance={800}
            target={[MAX_LARGEUR_CM / 2, HAUTEUR_BASE / 2, MAX_HAUTEUR_CM / 2]}
          />

          {/* Sol */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAX_LARGEUR_CM / 2, 0, MAX_HAUTEUR_CM / 2]}>
            <planeGeometry args={[MAX_LARGEUR_CM, MAX_HAUTEUR_CM]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>

          {/* Grille */}
          <gridHelper
            args={[MAX_LARGEUR_CM, 20, '#1e3a5f', '#1e293b']}
            position={[MAX_LARGEUR_CM / 2, 0.5, MAX_HAUTEUR_CM / 2]}
          />

          {/* Mur A (fond) */}
          <Box args={[MAX_LARGEUR_CM, 280, MUR_EP]} position={[MAX_LARGEUR_CM / 2, 140, -MUR_EP / 2]}>
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </Box>

          {/* Mur B (gauche) — seulement en L */}
          {pieceForme === 'en_L' && (
            <Box args={[MUR_EP, 280, MAX_HAUTEUR_CM]} position={[-MUR_EP / 2, 140, MAX_HAUTEUR_CM / 2]}>
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </Box>
          )}

          {/* Plafond léger */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[MAX_LARGEUR_CM / 2, 280, MAX_HAUTEUR_CM / 2]}>
            <planeGeometry args={[MAX_LARGEUR_CM + 50, MAX_HAUTEUR_CM + 50]} />
            <meshStandardMaterial color="#0c1220" side={THREE.DoubleSide} />
          </mesh>

          {/* Plan invisible pour drag dans la scène */}
          {draggingIdx !== null && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[MAX_LARGEUR_CM / 2, 0, MAX_HAUTEUR_CM / 2]}
              onPointerMove={handlePointerMove}
              visible={false}
            >
              <planeGeometry args={[10000, 10000]} />
              <meshBasicMaterial />
            </mesh>
          )}

          {/* Ombre simulée au sol */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAX_LARGEUR_CM / 2, 0.2, MAX_HAUTEUR_CM / 2]}>
            <planeGeometry args={[MAX_LARGEUR_CM, MAX_HAUTEUR_CM]} />
            <meshBasicMaterial color="#060d1a" transparent opacity={0.4} />
          </mesh>

          {/* Modules */}
          {modulesPositionnes.map((mod, index) => (
            <Module3D
              key={`${mod.module_id}-${index}`}
              mod={mod} index={index}
              pieceForme={pieceForme}
              setDraggingIdx={setDraggingIdx}
              isDragging={draggingIdx === index}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Message canvas vide */}
      {modulesPositionnes.length === 0 && (
        <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none">
          <div className="bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-medium px-4 py-2 rounded-xl">
            Glissez des modules depuis le catalogue pour composer votre cuisine
          </div>
        </div>
      )}
    </div>
  );
};

export default Configurateur3D;