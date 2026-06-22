import { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Image as KonvaImage } from 'react-konva';

const SCALE          = 1.5;
const MAX_LARGEUR_CM = 400;
const MAX_HAUTEUR_CM = 300;
const OFFSET_X       = 60;
const OFFSET_Y       = 80;
const PROFONDEUR_CM  = 60;
const MUR_EP         = 14;

const STYLE_CAT = {
  meuble_bas:     { stroke: '#3b82f6' },
  plan_travail:   { stroke: '#d97706' },
  electromenager: { stroke: '#8b5cf6' },
  meuble_haut:    { stroke: '#10b981' },
  evier:          { stroke: '#06b6d4' },
  colonne:        { stroke: '#ef4444' },
  robinetterie:   { stroke: '#22c55e' },
  default:        { stroke: '#64748b' },
};

const useImage = (url) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!url) { setImg(null); return; }
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.onload  = () => setImg(i);
    i.onerror = () => setImg(null);
    i.src = url;
  }, [url]);
  return img;
};

const BoutonRotation = ({ x, y, onClick }) => (
  <div
    onClick={onClick}
    style={{ position: 'absolute', left: x, top: y, zIndex: 20, cursor: 'pointer' }}
    className="w-7 h-7 bg-slate-800 hover:bg-emerald-500 border border-slate-600 hover:border-emerald-400 rounded-full flex items-center justify-center text-sm text-slate-300 hover:text-slate-950 shadow-lg transition-all select-none font-bold"
    title="Changer de Mur"
  >↻</div>
);

const ModuleKonva = ({ mod, index, onDeplacerModule, maxLargeurCm, pieceForme, pieceLargeurPx, pieceLongueurPx }) => {
  const [survol, setSurvol] = useState(false);
  const image    = useImage(mod.image_url || null);
  const style    = STYLE_CAT[mod.categorie] ?? STYLE_CAT.default;
  const rotation = mod.rotation || 0;
  const BARRE_H  = 22;

  // Calcul des dimensions de la boîte selon son orientation sur les murs
  const W = rotation === 0 ? mod.largeur_cm * SCALE : PROFONDEUR_CM * SCALE;
  const H = rotation === 0 ? PROFONDEUR_CM * SCALE : mod.largeur_cm * SCALE;

  const imgAreaW = W - 4;
  const imgAreaH = H - BARRE_H - 2;

  // Calcul proportionnel de l'image (Simulation parfaite de object-fit: contain)
  let drawW = imgAreaW;
  let drawH = imgAreaH;

  if (image) {
    const targetW = rotation === 0 ? imgAreaW : imgAreaH;
    const targetH = rotation === 0 ? imgAreaH : imgAreaW;
    const scaleFactor = Math.min(targetW / image.width, targetH / image.height);
    drawW = image.width * scaleFactor;
    drawH = image.height * scaleFactor;
  }

  return (
    <Group
      // Positionnement local strict selon l'ancrage du mur actuel
      x={rotation === -90 ? MUR_EP : mod.position_x * SCALE}
      y={rotation === -90 ? mod.position_y * SCALE : MUR_EP}
      draggable
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      
      // Moteur de collision géométrique et d'ancrage dynamique (Style IKEA)
      dragBoundFunc={(pos) => {
        const startX = OFFSET_X;
        const startY = OFFSET_Y;

        // Cas 1 : Plan linéaire simple (Uniquement le mur horizontal du fond)
        if (pieceForme !== 'en_L') {
          const W_A = mod.largeur_cm * SCALE;
          return {
            x: Math.max(startX, Math.min(pos.x, startX + pieceLongueurPx - W_A)),
            y: startY + MUR_EP
          };
        }

        // Cas 2 : Plan en L - Calcul du mur le plus proche du pointeur de la souris
        const W_A = mod.largeur_cm * SCALE; 
        const H_B = mod.largeur_cm * SCALE; 

        const distToMurA = Math.abs(pos.y - (startY + MUR_EP));
        const distToMurB = Math.abs(pos.x - (startX + MUR_EP));

        if (distToMurB < distToMurA && (pos.y - startY) > MUR_EP) {
          // L'utilisateur glisse vers le bas : Ancrage automatique sur le Mur B (Vertical gauche)
          return {
            x: startX + MUR_EP, 
            y: Math.max(startY + MUR_EP, Math.min(pos.y, startY + pieceLargeurPx - H_B))
          };
        } else {
          // L'utilisateur glisse vers la droite : Ancrage automatique sur le Mur A (Horizontal haut)
          return {
            x: Math.max(startX + MUR_EP, Math.min(pos.x, startX + pieceLongueurPx - W_A)),
            y: startY + MUR_EP 
          };
        }
      }}
      
      // Enregistrement propre en Base de Données selon le mur d'arrivée
      onDragEnd={(e) => {
        const localX = e.target.x();
        const localY = e.target.y();

        if (pieceForme === 'en_L' && Math.abs(localX - MUR_EP) < 2) {
          // Le module s'est arrêté sur le Mur B (Vertical)
          onDeplacerModule(index, {
            position_x: 0,
            position_y: Math.round(localY / SCALE),
            rotation: -90
          });
        } else {
          // Le module s'est arrêté sur le Mur A (Horizontal)
          onDeplacerModule(index, {
            position_x: Math.round(localX / SCALE),
            position_y: 0,
            rotation: 0
          });
        }
      }}
    >
      {/* Ombre portée */}
      <Rect x={4} y={4} width={W} height={H} fill="rgba(0,0,0,0.4)" cornerRadius={6} />

      {/* Fond du module */}
      <Rect
        width={W} height={H}
        fill="#0f172a"
        stroke={survol ? '#ffffff' : style.stroke}
        strokeWidth={survol ? 2.5 : 1.5}
        cornerRadius={6}
      />

      {/* Zone de masque isolée (Évite à 100% les débordements d'images sur les murs) */}
      <Group x={2} y={2} clipX={0} clipY={0} clipWidth={imgAreaW} clipHeight={imgAreaH}>
        {image ? (
          <KonvaImage
            image={image}
            x={imgAreaW / 2}
            y={imgAreaH / 2}
            width={drawW}
            height={drawH}
            offsetX={drawW / 2}
            offsetY={drawH / 2}
            rotation={rotation}
          />
        ) : (
          <Rect width={imgAreaW} height={imgAreaH} fill={style.stroke + '18'} />
        )}
      </Group>

      {/* Bandeau technique inférieur */}
      <Rect
        y={H - BARRE_H} width={W} height={BARRE_H}
        fill={style.stroke}
        cornerRadius={[0, 0, 5, 5]}
        opacity={0.95}
      />
      <Text
        text={mod.nom || 'Module'}
        fontSize={9} fontFamily="sans-serif" fontStyle="bold" fill="#ffffff"
        x={4} y={H - BARRE_H + 5}
        width={W - 36} ellipsis wrap="none"
      />
      <Text
        text={`${mod.largeur_cm}cm`}
        fontSize={8} fontFamily="monospace" fontStyle="bold" fill="rgba(255,255,255,0.9)"
        x={W - 34} y={H - BARRE_H + 6}
        align="right" width={30}
      />

      {/* Highlight lumineux au survol */}
      {survol && (
        <Rect width={W} height={H} fill="rgba(255,255,255,0.05)" stroke="#ffffff" strokeWidth={1.5} cornerRadius={6} />
      )}

      {/* Lignes de repères de dimensions */}
      <Group y={H}>
        <Line points={[0, 8, W, 8]} stroke={style.stroke} strokeWidth={1} opacity={0.5} />
        <Line points={[0, 4, 0, 12]} stroke={style.stroke} strokeWidth={1} opacity={0.5} />
        <Line points={[W, 4, W, 12]} stroke={style.stroke} strokeWidth={1} opacity={0.5} />
      </Group>
    </Group>
  );
};

const ConfigurateurCanvas = ({ pieceForme, modulesPositionnes, onDeplacerModule, onDropModule, onRotaterModule }) => {
  const pieceLongueurPx = MAX_LARGEUR_CM * SCALE;
  const pieceLargeurPx  = MAX_HAUTEUR_CM * SCALE;

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const canvas   = e.currentTarget.querySelector('canvas');
    const rect     = canvas ? canvas.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
    
    const mouseXPx = e.clientX - rect.left;
    const mouseYPx = e.clientY - rect.top;

    const localX = mouseXPx - OFFSET_X;
    const localY = mouseYPx - OFFSET_Y;
    
    const moduleId  = e.dataTransfer.getData('module_id');
    const largeurCm = parseInt(e.dataTransfer.getData('largeur_cm'), 10);
    const imageUrl  = e.dataTransfer.getData('image_url');
    const prixBase  = parseFloat(e.dataTransfer.getData('prix_base') || 0);
    const nom       = e.dataTransfer.getData('nom');
    const categorie = e.dataTransfer.getData('categorie');
    
    if (!moduleId) return;

    // Prise en compte de la proximité pour savoir sur quel mur lâcher le module initialement
    const distToMurA = Math.abs(localY - MUR_EP);
    const distToMurB = Math.abs(localX - MUR_EP);

    if (pieceForme === 'en_L' && distToMurB < distToMurA && localY > MUR_EP) {
      // Relâché sur le Mur de gauche (Vertical)
      const H_B = largeurCm * SCALE;
      const yContraint = Math.max(MUR_EP, Math.min(localY, pieceLargeurPx - H_B));
      onDropModule({
        module_id: moduleId, largeur_cm: largeurCm, image_url: imageUrl, prix_base: prixBase, nom, categorie,
        rotation: -90, position_x: 0, position_y: Math.round(yContraint / SCALE),
      });
    } else {
      // Relâché sur le Mur du fond (Horizontal)
      const W_A = largeurCm * SCALE;
      const minX = pieceForme === 'en_L' ? MUR_EP : 0;
      const xContraint = Math.max(minX, Math.min(localX, pieceLongueurPx - W_A));
      onDropModule({
        module_id: moduleId, largeur_cm: largeurCm, image_url: imageUrl, prix_base: prixBase, nom, categorie,
        rotation: 0, position_x: Math.round(xContraint / SCALE), position_y: 0,
      });
    }
  };

  const espaceOccupe = modulesPositionnes.reduce((acc, m) => acc + m.largeur_cm, 0);
  const prixTotal    = modulesPositionnes.reduce((acc, m) => acc + (parseFloat(m.prix_base) || 0), 0);
  const espaceLibre  = MAX_LARGEUR_CM - espaceOccupe;

  return (
    <div
      className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 border border-slate-900 rounded-2xl overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grille technique */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(to right,  #1e293b 1px, transparent 1px),
          linear-gradient(to bottom, #1e293b 1px, transparent 1px),
          linear-gradient(to right,  #0f172a80 1px, transparent 1px),
          linear-gradient(to bottom, #0f172a80 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px, 60px 60px, 12px 12px, 12px 12px',
        opacity: 0.5,
      }} />

      {/* Boutons de changement de mur manuels (Suivent désormais dynamiquement les modules) */}
      {modulesPositionnes.map((mod, index) => {
        const rotation = mod.rotation || 0;
        const W = rotation === 0 ? mod.largeur_cm * SCALE : PROFONDEUR_CM * SCALE;
        const posX = rotation === 0 ? MUR_EP : mod.position_x * SCALE;
        const posY = rotation === 0 ? mod.position_y * SCALE : MUR_EP;

        const btnX = OFFSET_X + posX + W - 4;
        const btnY = OFFSET_Y + posY - 14;
        return (
          <BoutonRotation
            key={`rot-${index}`}
            x={btnX} y={btnY}
            onClick={() => onRotaterModule(index)}
          />
        );
      })}

      {/* Panneau de statistiques */}
      <div className="absolute bottom-4 right-4 z-10 bg-slate--900/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl min-w-[210px] space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {pieceForme === 'en_L' ? 'Plan en L' : 'Plan Linéaire'}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500">Occupé</span>
            <span className="text-slate-300 font-mono font-bold">{espaceOccupe} cm</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500">Disponible</span>
            <span className={`font-mono font-bold ${espaceLibre < 60 ? 'text-red-400' : 'text-emerald-400'}`}>{espaceLibre} cm</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (espaceOccupe / MAX_LARGEUR_CM) * 100)}%` }} />
          </div>
        </div>
        {prixTotal > 0 && (
          <div className="border-t border-slate-800 pt-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Modules</span>
              <span className="text-slate-400">{modulesPositionnes.length} pcs</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-500">Estimation</span>
              <span className="text-sm font-bold text-emerald-400">{prixTotal.toLocaleString('fr-FR')} F</span>
            </div>
          </div>
        )}
      </div>

      {/* Message d'attente si vide */}
      {modulesPositionnes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl mb-2 opacity-10">🏠</p>
            <p className="text-xs text-slate-700 font-mono">Glissez des modules sur le plan</p>
          </div>
        </div>
      )}

      {/* Scène de rendu Konva */}
      <div className="border border-slate-800/40 rounded-xl overflow-hidden shadow-2xl">
        <Stage width={760} height={520}>
          <Layer>
            <Group x={OFFSET_X} y={OFFSET_Y}>

              {/* Texture de Sol */}
              <Rect
                width={pieceLongueurPx}
                height={pieceLargeurPx}
                fill="#0a1628" stroke="#1e3a5f" strokeWidth={0.5} cornerRadius={2}
              />

              {/* Mur principal (Fond - A) */}
              <Rect width={pieceLongueurPx} height={MUR_EP} fill="#334155" stroke="#475569" strokeWidth={1} />
              {Array.from({ length: Math.floor(pieceLongueurPx / 16) }).map((_, i) => (
                <Line key={i} points={[i * 16, 0, i * 16 + MUR_EP, MUR_EP]} stroke="#475569" strokeWidth={0.5} opacity={0.4} />
              ))}

              {/* Retour de Mur (Côté gauche - B) */}
              {pieceForme === 'en_L' && (
                <>
                  <Rect width={MUR_EP} height={pieceLargeurPx} fill="#334155" stroke="#475569" strokeWidth={1} />
                  {Array.from({ length: Math.floor(pieceLargeurPx / 16) }).map((_, i) => (
                    <Line key={i} points={[0, i * 16, MUR_EP, i * 16 + MUR_EP]} stroke="#475569" strokeWidth={0.5} opacity={0.4} />
                  ))}
                </>
              )}

              {/* Ligne de cote principale */}
              <Line points={[0, -18, pieceLongueurPx, -18]} stroke="#475569" strokeWidth={0.8} dash={[4, 2]} />
              <Line points={[0, -22, 0, -14]} stroke="#475569" strokeWidth={0.8} />
              <Line points={[pieceLongueurPx, -22, pieceLongueurPx, -14]} stroke="#475569" strokeWidth={0.8} />
              <Text text={`Mur A — ${MAX_LARGEUR_CM} cm`} fontSize={9} fontFamily="monospace" fill="#64748b" x={pieceLongueurPx / 2 - 40} y={-32} />

              {/* Injection des modules configurés */}
              {modulesPositionnes.map((mod, index) => (
                <ModuleKonva
                  key={`${mod.module_id}-${index}`}
                  mod={mod} index={index}
                  onDeplacerModule={onDeplacerModule}
                  maxLargeurCm={MAX_LARGEUR_CM}
                  pieceForme={pieceForme}
                  pieceLargeurPx={pieceLargeurPx}
                  pieceLongueurPx={pieceLongueurPx}
                />
              ))}

            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ConfigurateurCanvas;