import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';

// CORRECTION 2 : la valeur 'en_L' est maintenant alignée avec l'API partout
const ConfigurateurCanvas = ({ pieceForme, modulesPositionnes, onDeplacerModule, onDropModule }) => {
  const SCALE = 1.5;

  const MAX_LARGEUR_PIECE_CM = 400;
  const MAX_HAUTEUR_PIECE_CM = 300;

  const pieceLongueurPx = MAX_LARGEUR_PIECE_CM * SCALE;
  const pieceLargeurPx  = MAX_HAUTEUR_PIECE_CM * SCALE;
  const epaisseurMurPx  = 20;

  const OFFSET_X = 80;
  const OFFSET_Y = 80;

  const handleDragOver = (e) => e.preventDefault();

  /**
   * Contraint une position (en cm) dans les limites physiques de la pièce.
   * CORRECTION 2 : comparaison avec 'en_L' au lieu de 'L'
   */
  const ajusterPositionSelonLimites = (xCm, yCm, largeurCm, forme) => {
    const PROFONDEUR_CM = 60;
    let x = xCm;
    let y = yCm;

    if (forme === 'lineaire') {
      y = 0;
      x = Math.max(0, Math.min(x, MAX_LARGEUR_PIECE_CM - largeurCm));
    } else if (forme === 'en_L') {
      x = Math.max(0, Math.min(x, MAX_LARGEUR_PIECE_CM - largeurCm));
      y = Math.max(0, Math.min(y, MAX_HAUTEUR_PIECE_CM - PROFONDEUR_CM));
      // Force l'alignement contre l'un des deux murs
      if (x > PROFONDEUR_CM && y > PROFONDEUR_CM) {
        if (x < y) x = 0;
        else y = 0;
      }
    }

    return { x, y };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();

    const mouseXPx = e.clientX - rect.left - OFFSET_X;
    const mouseYPx = e.clientY - rect.top  - OFFSET_Y;

    const moduleId  = e.dataTransfer.getData('module_id');
    const largeurCm = parseInt(e.dataTransfer.getData('largeur_cm'), 10);

    if (!moduleId) return;

    const bruteXCm = mouseXPx / SCALE;
    const bruteYCm = pieceForme === 'lineaire' ? 0 : mouseYPx / SCALE;

    const pos = ajusterPositionSelonLimites(bruteXCm, bruteYCm, largeurCm, pieceForme);

    onDropModule({
      module_id:  moduleId,
      largeur_cm: largeurCm,
      position_x: Math.round(pos.x),
      position_y: Math.round(pos.y),
    });
  };

  return (
    <div
      className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 border border-slate-900 rounded-2xl overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 pointer-events-none"></div>

      {/* Légende */}
      <div className="absolute bottom-6 right-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-lg">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration Cuisine</p>
        <h3 className="text-lg font-bold text-white capitalize mt-0.5">
          {/* CORRECTION 2 : affichage propre selon 'en_L' */}
          Disposition {pieceForme === 'en_L' ? 'en L' : 'Linéaire'}
        </h3>
        <div className="flex items-center gap-2 mt-2 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <p className="text-[11px] text-emerald-400 font-medium tracking-wide">RG-02 Active — alignement automatique</p>
        </div>
      </div>

      {/* Stage Konva */}
      <div className="border border-slate-800/60 rounded-xl bg-slate-900/20 backdrop-blur-xs shadow-2xl overflow-hidden">
        <Stage width={750} height={550}>
          <Layer>
            <Group x={OFFSET_X} y={OFFSET_Y}>

              {/* Murs */}
              {pieceForme === 'lineaire' ? (
                <Rect
                  width={pieceLongueurPx}
                  height={epaisseurMurPx}
                  fill="#334155"
                  stroke="#475569"
                  strokeWidth={1}
                  cornerRadius={2}
                />
              ) : (
                <Group>
                  <Rect width={pieceLongueurPx} height={epaisseurMurPx} fill="#334155" stroke="#475569" strokeWidth={1} cornerRadius={2} />
                  <Rect width={epaisseurMurPx} height={pieceLargeurPx}  fill="#334155" stroke="#475569" strokeWidth={1} cornerRadius={2} />
                </Group>
              )}

              {/* Modules positionnés */}
              {modulesPositionnes.map((mod, index) => {
                const modWidthPx  = mod.largeur_cm * SCALE;
                const modHeightPx = 60 * SCALE;

                return (
                  <Group
                    key={`${mod.module_id}-${index}`}
                    // CORRECTION 5 : les coordonnées du Group sont relatives au Group parent (OFFSET déjà appliqué)
                    x={mod.position_x * SCALE}
                    y={mod.position_y * SCALE}
                    draggable
                    dragBoundFunc={(pos) => {
                      // pos est en coordonnées absolues de la Stage
                      // On soustrait OFFSET pour passer en coordonnées relatives au Group parent
                      const localXCm = (pos.x - OFFSET_X) / SCALE;
                      const localYCm = (pos.y - OFFSET_Y) / SCALE;

                      const contrainte = ajusterPositionSelonLimites(
                        localXCm, localYCm, mod.largeur_cm, pieceForme
                      );

                      // On re-ajoute OFFSET pour retourner en coordonnées absolues Stage
                      return {
                        x: contrainte.x * SCALE + OFFSET_X,
                        y: contrainte.y * SCALE + OFFSET_Y,
                      };
                    }}
                    onDragEnd={(e) => {
                      // e.target.x() / y() sont relatifs au Group parent → on divise directement
                      onDeplacerModule(index, {
                        position_x: Math.round(e.target.x() / SCALE),
                        position_y: Math.round(e.target.y() / SCALE),
                      });
                    }}
                  >
                    <Rect
                      width={modWidthPx}
                      height={modHeightPx}
                      fill="rgba(16, 185, 129, 0.12)"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      cornerRadius={4}
                    />
                    <Line
                      points={[0, 0, modWidthPx, modHeightPx]}
                      stroke="rgba(16, 185, 129, 0.15)"
                      strokeWidth={1}
                    />
                    <Text
                      text={mod.nom ? `${mod.nom}\n${mod.largeur_cm} cm` : `${mod.largeur_cm} cm`}
                      fontSize={10}
                      fontFamily="sans-serif"
                      fill="#a7f3d0"
                      x={6}
                      y={6}
                      fontStyle="bold"
                      lineHeight={1.4}
                    />
                  </Group>
                );
              })}

            </Group>
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ConfigurateurCanvas;