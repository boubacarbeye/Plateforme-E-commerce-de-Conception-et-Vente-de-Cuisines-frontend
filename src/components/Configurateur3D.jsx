import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CM = 0.01;

const Configurateur3D = ({ pieceForme, modulesPositionnes }) => {
  const mountRef = useRef(null);
  const [dimensions, setDimensions] = useState({ longueur: 400, largeur: 300, hauteur: 280 });
  const [dimTemp, setDimTemp] = useState({ longueur: 400, largeur: 300, hauteur: 280 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    const longueurM = dimensions.longueur * CM;
    const largeurM  = dimensions.largeur  * CM;
    const hauteurM  = dimensions.hauteur  * CM;
    const ep = 0.12;

    // ===== SCÈNE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2f4f8);

    // ===== CAMÉRA =====
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(longueurM * 0.5, hauteurM * 0.9, largeurM * 1.8);
    camera.lookAt(longueurM * 0.5, hauteurM * 0.3, 0);

    // ===== RENDERER =====
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ===== CONTRÔLES =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1;
    controls.maxDistance = longueurM * 4;
    controls.maxPolarAngle = Math.PI / 1.9;
    controls.target.set(longueurM * 0.5, hauteurM * 0.3, 0);

    // ===== ÉCLAIRAGE =====
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd0d8e8, 0.5);
    scene.add(hemi);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.1);
    dir1.position.set(longueurM, hauteurM * 2.5, largeurM * 2);
    dir1.castShadow = true;
    dir1.shadow.mapSize.set(2048, 2048);
    dir1.shadow.camera.left   = -longueurM * 1.5;
    dir1.shadow.camera.right  =  longueurM * 1.5;
    dir1.shadow.camera.top    =  hauteurM * 2;
    dir1.shadow.camera.bottom = -1;
    dir1.shadow.bias = -0.001;
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xfff0e0, 0.35);
    dir2.position.set(-longueurM, hauteurM, largeurM);
    scene.add(dir2);

    // ===== TEXTURE SOL PARQUETÉ =====
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 1024;
    const ctx = cvs.getContext('2d');
    const lH = 80, lW = 200;
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 7; c++) {
        const off = r % 2 === 0 ? 0 : lW / 2;
        const x = c * lW - off;
        const y = r * lH;
        const b = 172 + Math.floor(Math.random() * 28);
        ctx.fillStyle = `rgb(${b},${Math.round(b*0.73)},${Math.round(b*0.43)})`;
        ctx.fillRect(x+1, y+1, lW-2, lH-2);
        ctx.strokeStyle = 'rgba(90,55,15,0.18)';
        ctx.lineWidth = 1;
        for (let v = 0; v < 5; v++) {
          ctx.beginPath();
          ctx.moveTo(x + lW/5*v + Math.random()*4, y+2);
          ctx.lineTo(x + lW/5*v + Math.random()*4 + 6, y+lH-2);
          ctx.stroke();
        }
      }
    }
    const solTex = new THREE.CanvasTexture(cvs);
    solTex.wrapS = solTex.wrapT = THREE.RepeatWrapping;
    solTex.repeat.set(longueurM * 1.8, largeurM * 1.8);

    // ===== SOL =====
    const sol = new THREE.Mesh(
      new THREE.PlaneGeometry(longueurM * 3, largeurM * 3),
      new THREE.MeshLambertMaterial({ map: solTex })
    );
    sol.rotation.x = -Math.PI / 2;
    sol.position.set(longueurM / 2, 0, largeurM / 2);
    sol.receiveShadow = true;
    scene.add(sol);

    // Grille subtile
    const grille = new THREE.GridHelper(20, 80, 0xbbbbbb, 0xcccccc);
    grille.position.set(longueurM/2, 0.001, largeurM/2);
    grille.material.opacity = 0.2;
    grille.material.transparent = true;
    scene.add(grille);

    // ===== MURS =====
    const murMat  = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
    const murMat2 = new THREE.MeshLambertMaterial({ color: 0xe9e9e9 });

    // Mur fond A
    const murA = new THREE.Mesh(new THREE.BoxGeometry(longueurM + ep*2, hauteurM, ep), murMat);
    murA.position.set(longueurM/2, hauteurM/2, -ep/2);
    murA.receiveShadow = true;
    scene.add(murA);

    // Mur gauche B
    const murB = new THREE.Mesh(new THREE.BoxGeometry(ep, hauteurM, largeurM + ep), murMat2);
    murB.position.set(-ep/2, hauteurM/2, largeurM/2);
    murB.receiveShadow = true;
    scene.add(murB);

    // Mur droit C
    if (pieceForme !== 'en_L') {
      const murC = new THREE.Mesh(new THREE.BoxGeometry(ep, hauteurM, largeurM + ep), murMat2);
      murC.position.set(longueurM + ep/2, hauteurM/2, largeurM/2);
      murC.receiveShadow = true;
      scene.add(murC);
    }

    // Plafond
    const plafond = new THREE.Mesh(
      new THREE.PlaneGeometry(longueurM, largeurM),
      new THREE.MeshLambertMaterial({ color: 0xfafafa, side: THREE.DoubleSide })
    );
    plafond.rotation.x = Math.PI / 2;
    plafond.position.set(longueurM/2, hauteurM, largeurM/2);
    scene.add(plafond);

    // ===== HELPER : ajouter un mesh =====
    const add = (geo, mat, x, y, z, rx=0, ry=0, rz=0, shadow=true) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      if (shadow) { m.castShadow = true; m.receiveShadow = true; }
      scene.add(m);
      return m;
    };

    // ===== MATÉRIAUX RÉUTILISABLES =====
    const matGris      = (c=0x8a9bb0) => new THREE.MeshLambertMaterial({ color: c });
    const matInox      = () => new THREE.MeshLambertMaterial({ color: 0xc8d0d8 });
    const matNoir      = () => new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const matPlan      = () => new THREE.MeshLambertMaterial({ color: 0xddd8d0 });
    const matPoignee   = () => new THREE.MeshLambertMaterial({ color: 0x909090 });
    const matVerre     = () => new THREE.MeshLambertMaterial({ color: 0x88aacc, transparent: true, opacity: 0.35 });

    // ===== DESSIN D'UN MEUBLE BAS RÉALISTE =====
    const dessinerMeubleBas = (px, pz, largeur, couleur) => {
      const prof  = 0.60;
      const haut  = 0.87;
      const nbP   = largeur > 0.5 ? 2 : 1;
      const matC  = matGris(couleur);

      // Corps
      add(new THREE.BoxGeometry(largeur, haut, prof), matC, px+largeur/2, haut/2, prof/2);

      // Côtés visibles (panneaux latéraux)
      add(new THREE.BoxGeometry(0.018, haut-0.02, prof-0.02), matGris(new THREE.Color(couleur).multiplyScalar(0.9).getHex()),
        px+0.009, haut/2, prof/2);
      add(new THREE.BoxGeometry(0.018, haut-0.02, prof-0.02), matGris(new THREE.Color(couleur).multiplyScalar(0.9).getHex()),
        px+largeur-0.009, haut/2, prof/2);

      // Portes
      const lP = (largeur - 0.01) / nbP;
      for (let i = 0; i < nbP; i++) {
        const cx = px + 0.005 + i*lP + lP/2;
        // Panneau porte
        add(new THREE.BoxGeometry(lP-0.006, haut-0.012, 0.020),
          matGris(new THREE.Color(couleur).multiplyScalar(1.04).getHex()),
          cx, haut/2, prof+0.010);
        // Rainure décorative
        add(new THREE.BoxGeometry(lP-0.04, haut-0.08, 0.003),
          matGris(new THREE.Color(couleur).multiplyScalar(0.88).getHex()),
          cx, haut/2, prof+0.021);
        // Poignée horizontale
        add(new THREE.BoxGeometry(lP*0.55, 0.013, 0.013), matPoignee(),
          cx, haut*0.38, prof+0.027);
      }

      // Socle
      add(new THREE.BoxGeometry(largeur, 0.10, prof-0.04), matGris(0x222222),
        px+largeur/2, 0.05, (prof-0.04)/2);

      // Plan de travail
      add(new THREE.BoxGeometry(largeur+0.02, 0.035, prof+0.06), matPlan(),
        px+largeur/2, haut+0.0175, prof/2+0.01);

      // Bord avant du plan (légère couleur différente)
      add(new THREE.BoxGeometry(largeur+0.02, 0.035, 0.006), matGris(0xc8c0b4),
        px+largeur/2, haut+0.0175, prof+0.063);
    };

    // ===== DESSIN D'UN MEUBLE HAUT RÉALISTE =====
    const dessinerMeubleHaut = (px, pz, largeur, couleur, hauteurPiece) => {
      const prof  = 0.35;
      const haut  = 0.72;
      const yBase = hauteurPiece - 0.08 - haut;
      const nbP   = largeur > 0.5 ? 2 : 1;
      const lP    = (largeur - 0.01) / nbP;
      const matC  = matGris(couleur);

      // Corps
      add(new THREE.BoxGeometry(largeur, haut, prof), matC, px+largeur/2, yBase+haut/2, prof/2);

      // Portes
      for (let i = 0; i < nbP; i++) {
        const cx = px + 0.005 + i*lP + lP/2;
        add(new THREE.BoxGeometry(lP-0.006, haut-0.012, 0.018),
          matGris(new THREE.Color(couleur).multiplyScalar(1.04).getHex()),
          cx, yBase+haut/2, prof+0.009);
        add(new THREE.BoxGeometry(lP-0.04, haut-0.08, 0.003),
          matGris(new THREE.Color(couleur).multiplyScalar(0.88).getHex()),
          cx, yBase+haut/2, prof+0.018);
        // Poignée horizontale
        add(new THREE.BoxGeometry(lP*0.5, 0.012, 0.012), matPoignee(),
          cx, yBase+haut*0.25, prof+0.024);
      }

      // Dessous du meuble (éclairage LED fictif)
      add(new THREE.BoxGeometry(largeur-0.01, 0.012, 0.02), matGris(0xffffee),
        px+largeur/2, yBase-0.006, 0.01);
    };

    // ===== DESSIN D'UN ÉVIER RÉALISTE =====
    const dessinerEvier = (px, pz, largeur) => {
      const prof = 0.60;
      const haut = 0.87;

      // Caisson sous évier (portes)
      dessinerMeubleBas(px, pz, largeur, 0x8a9bb0);

      // Dessus inox
      add(new THREE.BoxGeometry(largeur+0.02, 0.025, prof+0.06), matInox(),
        px+largeur/2, haut+0.0125, prof/2+0.01);

      // Double bac
      const bacL = largeur * 0.42;
      const bacP = prof * 0.60;
      const bacH = 0.18;
      const yBac = haut - bacH/2 + 0.005;

      // Bac gauche
      add(new THREE.BoxGeometry(bacL, bacH, bacP), matInox(),
        px + largeur*0.24, yBac, prof*0.42);
      // Bac droit (plus petit)
      add(new THREE.BoxGeometry(bacL*0.75, bacH, bacP), matInox(),
        px + largeur*0.72, yBac, prof*0.42);

      // Robinet
      const rX = px + largeur * 0.48;
      const rZ = prof * 0.18;
      // Base robinet
      add(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 12), matInox(), rX, haut+0.05, rZ);
      // Corps robinet
      add(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12), matInox(), rX, haut+0.16, rZ);
      // Bec verseur courbe
      add(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 12), matInox(),
        rX+0.06, haut+0.25, rZ, 0, 0, Math.PI/4);
      // Poignée
      add(new THREE.BoxGeometry(0.10, 0.012, 0.012), matInox(), rX, haut+0.235, rZ+0.04);
    };

    // ===== DESSIN D'UNE COLONNE FOUR =====
    const dessinerColonne = (px, pz, largeur, couleur) => {
      const prof = 0.60;
      const haut = 2.10;
      const matC = matGris(couleur);

      // Corps colonne
      add(new THREE.BoxGeometry(largeur, haut, prof), matC, px+largeur/2, haut/2, prof/2);

      // Four intégré (milieu)
      const fourH = 0.50;
      const fourY = 0.90;
      add(new THREE.BoxGeometry(largeur-0.04, fourH, 0.02), matNoir(),
        px+largeur/2, fourY, prof+0.01);
      // Vitre four
      add(new THREE.BoxGeometry(largeur-0.06, fourH-0.04, 0.015), matVerre(),
        px+largeur/2, fourY, prof+0.016);
      // Poignée four
      add(new THREE.BoxGeometry(largeur*0.65, 0.014, 0.014), matPoignee(),
        px+largeur/2, fourY+fourH*0.42, prof+0.026);
      // Commandes four
      add(new THREE.BoxGeometry(largeur-0.04, 0.06, 0.015), matNoir(),
        px+largeur/2, fourY+fourH/2+0.04, prof+0.01);

      // Tiroir bas
      add(new THREE.BoxGeometry(largeur-0.012, 0.14, 0.018), matGris(new THREE.Color(couleur).multiplyScalar(1.05).getHex()),
        px+largeur/2, 0.35, prof+0.009);
      add(new THREE.BoxGeometry(largeur*0.55, 0.012, 0.012), matPoignee(),
        px+largeur/2, 0.35, prof+0.025);

      // Porte haute
      add(new THREE.BoxGeometry(largeur-0.012, haut-fourH-fourY-0.05, 0.018), matGris(new THREE.Color(couleur).multiplyScalar(1.04).getHex()),
        px+largeur/2, fourY+fourH+0.25, prof+0.009);
      add(new THREE.BoxGeometry(largeur*0.5, 0.012, 0.012), matPoignee(),
        px+largeur/2, fourY+fourH+0.18, prof+0.025);

      // Plan de travail
      add(new THREE.BoxGeometry(largeur+0.02, 0.035, prof+0.06), matPlan(),
        px+largeur/2, haut+0.0175, prof/2+0.01);
    };

    // ===== DESSIN D'UN ÉLECTROMÉNAGER (FRIGO) =====
    const dessinerElectromenager = (px, pz, largeur, couleur) => {
      const prof = 0.60;
      const haut = 1.80;

      // Corps frigo
      add(new THREE.BoxGeometry(largeur, haut, prof), matNoir(),
        px+largeur/2, haut/2, prof/2);

      // Porte frigo haute (2/3)
      add(new THREE.BoxGeometry(largeur-0.012, haut*0.65-0.006, 0.022),
        matGris(0x2a2a2a), px+largeur/2, haut*0.67, prof+0.011);
      // Porte frigo basse (1/3 - congélateur)
      add(new THREE.BoxGeometry(largeur-0.012, haut*0.32-0.006, 0.022),
        matGris(0x252525), px+largeur/2, haut*0.17, prof+0.011);

      // Poignée frigo haute
      add(new THREE.BoxGeometry(0.012, haut*0.30, 0.012), matPoignee(),
        px+largeur*0.88, haut*0.67, prof+0.028);
      // Poignée congél
      add(new THREE.BoxGeometry(0.012, haut*0.15, 0.012), matPoignee(),
        px+largeur*0.88, haut*0.17, prof+0.028);

      // Liseré entre portes
      add(new THREE.BoxGeometry(largeur-0.012, 0.015, 0.024), matGris(0x111111),
        px+largeur/2, haut*0.345, prof+0.012);
    };

    // ===== DESSIN D'UN PLAN DE CUISSON =====
    const dessinerPlanCuisson = (px, pz, largeur) => {
      const prof = 0.60;
      const haut = 0.87;

      // Caisson bas
      dessinerMeubleBas(px, pz, largeur, 0x8a9bb0);

      // Dessus inox/verre
      add(new THREE.BoxGeometry(largeur+0.01, 0.020, prof+0.02), matNoir(),
        px+largeur/2, haut+0.01, prof/2);

      // 4 brûleurs
      const positions = [
        [0.28, 0.30], [0.28, 0.70],
        [0.72, 0.30], [0.72, 0.70]
      ];
      positions.forEach(([fx, fz]) => {
        // Anneau brûleur
        add(new THREE.TorusGeometry(largeur*0.12, 0.008, 8, 24), matGris(0x444444),
          px+largeur*fx, haut+0.022, prof*fz, Math.PI/2, 0, 0);
        // Centre brûleur
        add(new THREE.CylinderGeometry(largeur*0.04, largeur*0.04, 0.008, 16), matGris(0x333333),
          px+largeur*fx, haut+0.022, prof*fz);
      });
    };

    // ===== DESSIN D'UNE HOTTE =====
    const dessinerHotte = (px, pz, largeur, hauteurPiece) => {
      const prof  = 0.50;
      const haut  = 0.55;
      const yBase = hauteurPiece - 0.12 - haut;

      // Corps hotte pyramidal
      add(new THREE.BoxGeometry(largeur, haut*0.6, prof), matGris(0xc0c8d0),
        px+largeur/2, yBase+haut*0.7, prof/2);
      // Base hotte évasée
      add(new THREE.BoxGeometry(largeur+0.08, haut*0.4, prof+0.06), matGris(0xb8c0c8),
        px+largeur/2, yBase+haut*0.2, (prof+0.06)/2);
      // Bandeau LED
      add(new THREE.BoxGeometry(largeur-0.04, 0.025, 0.020), matGris(0xffffee),
        px+largeur/2, yBase+0.012, prof+0.04);
      // Commandes
      add(new THREE.BoxGeometry(largeur*0.4, 0.022, 0.016), matGris(0x333333),
        px+largeur*0.3, yBase+haut*0.42, prof/2+0.008);
    };

    // ===== INJECTION DES MODULES =====
    modulesPositionnes.forEach((mod) => {
      const larg     = mod.largeur_cm * CM;
      const rotation = mod.rotation || 0;
      const px       = rotation === 0 ? mod.position_x * CM : 0;
      const pz       = rotation === 0 ? 0 : mod.position_y * CM;

      switch (mod.categorie) {
        case 'meuble_bas':
          dessinerMeubleBas(px, pz, larg, 0x8a9bb0);
          break;
        case 'meuble_haut':
          dessinerMeubleHaut(px, pz, larg, 0x9aaabb, hauteurM);
          break;
        case 'evier':
          dessinerEvier(px, pz, larg);
          break;
        case 'colonne':
          dessinerColonne(px, pz, larg, 0x8a9bb0);
          break;
        case 'electromenager':
          dessinerElectromenager(px, pz, larg, 0x1a1a1a);
          break;
        case 'plan_travail':
          dessinerPlanCuisson(px, pz, larg);
          break;
        case 'robinetterie':
          dessinerMeubleBas(px, pz, larg, 0x7a8fa0);
          break;
        default:
          dessinerMeubleBas(px, pz, larg, 0x8a9bb0);
      }
    });

    // ===== ANIMATION =====
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const W = container.clientWidth;
      const H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [pieceForme, modulesPositionnes, dimensions]);

  return (
    <div className="w-full h-full flex flex-col gap-3" style={{ minHeight: '520px' }}>
      <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 flex-shrink-0">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Dimensions pièce</span>
        {[['L', 'longueur', 200, 800], ['P', 'largeur', 150, 600], ['H', 'hauteur', 220, 350]].map(([label, key, min, max]) => (
          <div key={key} className="flex items-center gap-1">
            <label className="text-[10px] text-slate-500">{label}</label>
            <input type="number" value={dimTemp[key]}
              onChange={e => setDimTemp(p => ({ ...p, [key]: parseInt(e.target.value) || min }))}
              className="w-16 bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg text-center"
              min={min} max={max} />
            <span className="text-[10px] text-slate-600">cm</span>
          </div>
        ))}
        <button onClick={() => setDimensions({ ...dimTemp })}
          className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-400">
          Appliquer
        </button>
        <span className="text-[10px] text-slate-600 ml-2">Clic gauche : rotation · Scroll : zoom · Clic droit : déplacer</span>
      </div>
      <div ref={mountRef} className="flex-1 rounded-2xl overflow-hidden" />
    </div>
  );
};

export default Configurateur3D;