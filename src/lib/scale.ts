// src/lib/scale.ts
export const calculateScale = (longueurCm: number, largeurCm: number, maxWidthPx: number, maxHeightPx: number) => {
  const scaleX = maxWidthPx / longueurCm;
  const scaleY = maxHeightPx / largeurCm;
  // On prend le plus petit ratio pour que la pièce tienne entièrement
  return Math.min(scaleX, scaleY) * 0.9; // 0.9 pour laisser une marge
};