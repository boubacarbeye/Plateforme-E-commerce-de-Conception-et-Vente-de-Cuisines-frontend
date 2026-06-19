import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';

const ConfigurateurCanvas = ({ pieceForme, modulesPositionnes, onDeplacerModule, onDropModule }) => {
    // Échelle de conversion : 1 cm réel = 1.5 pixel écran
    const SCALE = 1.5; 
    
    // Périmètre utile max de la pièce en cm
    const MAX_LARGEUR_PIECE_CM = 400;
    const MAX_HAUTEUR_PIECE_CM = 300;
    
    const pieceLongueurPx = MAX_LARGEUR_PIECE_CM * SCALE;
    const pieceLargeurPx = MAX_HAUTEUR_PIECE_CM * SCALE;
    const epaisseurMurPx = 20;

    // Marges de décalage de la scène pour laisser respirer le plan
    const OFFSET_X = 80;
    const OFFSET_Y = 80;

    const handleDragOver = (e) => e.preventDefault();

    /**
     * ALGORITHME DE VÉRIFICATION RG-02 (Calcul des limites physiques)
     */
    const ajusterPositionSelonLimites = (xCm, yCm, largeurCm, forme) => {
        const PROFONDEUR_STANDARD_CM = 60;
        let xAjuste = xCm;
        let yAjuste = yCm;

        if (forme === 'lineaire') {
            yAjuste = 0; 
            if (xAjuste < 0) xAjuste = 0;
            if (xAjuste + largeurCm > MAX_LARGEUR_PIECE_CM) {
                xAjuste = MAX_LARGEUR_PIECE_CM - largeurCm;
            }
        } else if (forme === 'L') {
            if (xAjuste < 0) xAjuste = 0;
            if (yAjuste < 0) yAjuste = 0;
            if (xAjuste + largeurCm > MAX_LARGEUR_PIECE_CM) xAjuste = MAX_LARGEUR_PIECE_CM - largeurCm;
            if (yAjuste + PROFONDEUR_STANDARD_CM > MAX_HAUTEUR_PIECE_CM) yAjuste = MAX_HAUTEUR_PIECE_CM - PROFONDEUR_STANDARD_CM;

            if (xAjuste > PROFONDEUR_STANDARD_CM && yAjuste > PROFONDEUR_STANDARD_CM) {
                if (xAjuste < yAjuste) {
                    xAjuste = 0; 
                } else {
                    yAjuste = 0; 
                }
            }
        }

        return { x: xAjuste, y: yAjuste };
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        
        const mouseXPx = e.clientX - rect.left - OFFSET_X;
        const mouseYPx = e.clientY - rect.top - OFFSET_Y;

        const moduleId = e.dataTransfer.getData("module_id");
        const largeurCm = parseInt(e.dataTransfer.getData("largeur_cm"), 10);

        if (moduleId) {
            const bruteXCm = mouseXPx / SCALE;
            const bruteYCm = pieceForme === 'lineaire' ? 0 : mouseYPx / SCALE;

            const posAjustee = ajusterPositionSelonLimites(bruteXCm, bruteYCm, largeurCm, pieceForme);

            onDropModule({
                module_id: moduleId,
                largeur_cm: largeurCm,
                position_x: Math.round(posAjustee.x),
                position_y: Math.round(posAjustee.y)
            });
        }
    };

    return (
        <div 
            className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 border border-slate-900 rounded-2xl overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Trame technique de fond */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 pointer-events-none"></div>

            {/* ENCADRÉ NETTOYÉ : Zéro emoji/sticker, utilisation d'un voyant CSS pur */}
            <div className="absolute bottom-6 right-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-lg pointer-events-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configuration Cuisine</p>
                <h3 className="text-lg font-bold text-white capitalize mt-0.5">Disposition {pieceForme === 'L' ? 'en L' : 'Linéaire'}</h3>
                
                {/* Badge technique épuré avec un point indicateur vert */}
                <div className="flex items-center gap-2 mt-2 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <p className="text-[11px] text-emerald-400 font-medium tracking-wide">Règle RG-02 Active : Alignement automatique aux murs</p>
                </div>
            </div>

            {/* Zone du Stage Konva */}
            <div className="border border-slate-800/60 rounded-xl bg-slate-900/20 backdrop-blur-xs shadow-2xl overflow-hidden">
                <Stage width={750} height={550}>
                    <Layer>
                        
                        <Group x={OFFSET_X} y={OFFSET_Y}>
                            
                            {/* 1. DESSIN DES MURS ARCHITECTURAUX */}
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
                                    <Rect width={pieceLongueurPx} height={epaisseurMurPx} fill="#334155" cornerRadius={2} />
                                    <Rect width={epaisseurMurPx} height={pieceLargeurPx} fill="#334155" cornerRadius={2} />
                                </Group>
                            )}

                            {/* 2. RENDU INTERACTIF DES MEUBLES */}
                            {modulesPositionnes.map((mod, index) => {
                                const modWidthPx = mod.largeur_cm * SCALE;
                                const modHeightPx = 60 * SCALE; 

                                return (
                                    <Group
                                        key={index}
                                        x={mod.position_x * SCALE}
                                        y={mod.position_y * SCALE}
                                        draggable
                                        dragBoundFunc={(pos) => {
                                            const localXCm = (pos.x - OFFSET_X) / SCALE;
                                            const localYCm = (pos.y - OFFSET_Y) / SCALE;

                                            const contrainte = ajusterPositionSelonLimites(localXCm, localYCm, mod.largeur_cm, pieceForme);

                                            return {
                                                x: (contrainte.x * SCALE) + OFFSET_X,
                                                y: (contrainte.y * SCALE) + OFFSET_Y
                                            };
                                        }}
                                        onDragEnd={(e) => {
                                            onDeplacerModule(index, {
                                                position_x: Math.round(e.target.x() / SCALE),
                                                position_y: Math.round(e.target.y() / SCALE)
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
                                            text={`${mod.largeur_cm} cm`}
                                            fontSize={10}
                                            fontFamily="sans-serif"
                                            fill="#a7f3d0"
                                            x={6}
                                            y={6}
                                            fontWeight="bold"
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