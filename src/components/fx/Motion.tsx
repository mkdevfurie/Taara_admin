import { useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

/** Carte d'indicateur : simple apparition en fondu, décalée dans le temps. */
export function StatCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={clsx('card', className)}
    >
      {children}
    </motion.div>
  );
}

/** Nombre qui défile de 0 à sa valeur quand il apparaît à l'écran. */
export function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString('fr-FR'));

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = fmt(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref}>{fmt(0)}</span>;
}

/** Transition d'entrée des pages (fondu + légère profondeur). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
