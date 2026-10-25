/** WebGL disponible ? (sinon on affiche un fond CSS de repli, jamais d'écran cassé) */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export const GOLD = '#f5a623';
export const AMBER = '#ff8c00';
export const INDIGO = '#5b6bff';
export const NIGHT = '#080c18';
