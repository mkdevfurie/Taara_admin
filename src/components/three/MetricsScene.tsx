import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { MathUtils } from 'three';

import { GOLD, INDIGO, prefersReducedMotion } from './support';

export interface Metric {
  label: string;
  value: number;
  color?: string;
  display?: string;
}

/** Une colonne qui « pousse » jusqu'à sa hauteur avec un ressort. */
function Bar({
  x,
  height,
  color,
  metric,
  delay,
}: {
  x: number;
  height: number;
  color: string;
  metric: Metric;
  delay: number;
}) {
  const mesh = useRef<Mesh>(null);
  const label = useRef<Group>(null);
  const t0 = useRef<number | null>(null);

  useFrame((state) => {
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = Math.max(0, state.clock.elapsedTime - t0.current - delay);
    const k = 1 - Math.exp(-t * 3.2) * Math.cos(t * 5); // ressort amorti
    const h = Math.max(0.02, height * MathUtils.clamp(k, 0, 1.08));
    if (mesh.current) {
      mesh.current.scale.y = h;
      mesh.current.position.y = h / 2;
    }
    if (label.current) label.current.position.y = h + 0.35;
  });

  return (
    <group position={[x, 0, 0]}>
      <RoundedBox ref={mesh} args={[0.7, 1, 0.7]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
      </RoundedBox>
      <group ref={label}>
        <Html center distanceFactor={7} zIndexRange={[10, 0]}>
          <div className="pointer-events-none select-none whitespace-nowrap text-center">
            <div className="font-display text-lg font-semibold text-white drop-shadow">
              {metric.display ?? metric.value.toLocaleString('fr-FR')}
            </div>
          </div>
        </Html>
      </group>
      <Html position={[0, -0.25, 0.5]} center distanceFactor={7} zIndexRange={[10, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap text-[11px] uppercase tracking-wider text-slate-300">
          {metric.label}
        </div>
      </Html>
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.25;
  });
  return <group ref={g}>{children}</group>;
}

/** Histogramme 3D des indicateurs clés (hauteurs normalisées, valeurs réelles en étiquette). */
export default function MetricsScene({ metrics }: { metrics: Metric[] }) {
  const max = Math.max(1, ...metrics.map((m) => m.value));
  const spacing = 1.6;
  const offset = ((metrics.length - 1) * spacing) / 2;
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 3.4, 9], fov: 42 }}
      dpr={[1, 1.75]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <Rig>
        <group position={[0, -1.3, 0]}>
          {metrics.map((m, i) => (
            <Bar
              key={m.label}
              x={i * spacing - offset}
              height={0.3 + (m.value / max) * 2.6}
              color={m.color ?? (i % 2 ? INDIGO : GOLD)}
              metric={m}
              delay={reduced ? 0 : i * 0.12}
            />
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
            <circleGeometry args={[offset + 2, 64]} />
            <meshStandardMaterial color="#0f1424" transparent opacity={0.85} />
          </mesh>
          <gridHelper
            args={[(offset + 2) * 2, 24, '#2a3150', '#1a1f33']}
            position={[0, 0.002, 0]}
          />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />
        </group>
      </Rig>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
      />
    </Canvas>
  );
}
