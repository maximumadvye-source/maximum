'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Theme } from '@/lib/settings';

type V3 = [number, number, number];

/* ───────── لوحتا الألوان: القديمة (داكنة) والجديدة (كريمية) ───────── */
interface Palette {
  volt: string;
  spark: string;
  green: string;
  body: string;
  plate: string;
  edge: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambient: number;
  sun: number;
  sunColor: string;
  voltLight: number;
  sparkLight: number;
  glowRGB: string;
  glowAlpha: number;
  additive: boolean;
  dust: string;
  dustOpacity: number;
  gridA: string;
  gridB: string;
  gridOpacity: number;
}

const PALETTES: Record<Theme, Palette> = {
  new: {
    volt: '#2f5bff',
    spark: '#ff7a1a',
    green: '#2fd480',
    body: '#0d1e5e',
    plate: '#07113d',
    edge: '#3048ef',
    fog: '#fbfaf7',
    fogNear: 10,
    fogFar: 26,
    ambient: 1.0,
    sun: 2.2,
    sunColor: '#ffffff',
    voltLight: 22,
    sparkLight: 16,
    glowRGB: '16,37,200',
    glowAlpha: 0.22,
    additive: false,
    dust: '#1025c8',
    dustOpacity: 0.4,
    gridA: '#1025c8',
    gridB: '#07113d',
    gridOpacity: 0.12,
  },
  old: {
    volt: '#00b4ff',
    spark: '#ffc233',
    green: '#3dff9a',
    body: '#111a2e',
    plate: '#0a101d',
    edge: '#00b4ff',
    fog: '#070b14',
    fogNear: 10,
    fogFar: 24,
    ambient: 0.55,
    sun: 1.6,
    sunColor: '#cfe9ff',
    voltLight: 25,
    sparkLight: 18,
    glowRGB: '0,180,255',
    glowAlpha: 0.55,
    additive: true,
    dust: '#7fd4ff',
    dustOpacity: 0.6,
    gridA: '#0e5a8a',
    gridB: '#0b2540',
    gridOpacity: 1,
  },
};

/* ───────── قاطع كهربائي واحد مع مؤشر LED يومض ───────── */
function Breaker({ x, y, phase, color }: { x: number; y: number; phase: number; color: string }) {
  const led = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (led.current) {
      led.current.emissiveIntensity = 1.3 + Math.sin(clock.elapsedTime * 1.6 + phase) * 1.1;
    }
  });

  return (
    <group position={[x, y, 0.22]}>
      <mesh>
        <boxGeometry args={[0.34, 0.72, 0.28]} />
        <meshStandardMaterial color="#dfe6f1" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.08, 0.15]}>
        <boxGeometry args={[0.2, 0.22, 0.08]} />
        <meshStandardMaterial color="#1b2433" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.24, 0.145]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial ref={led} color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

/* ───────── لوحة التوزيع ───────── */
const ROWS = [1.65, 0.55, -0.55, -1.65];
const COLS = [-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6];

function Panel({ p }: { p: Palette }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(4.2, 5.2, 0.35)), []);
  const ledColors = [p.green, p.volt, p.green, p.spark];

  return (
    <group>
      <mesh>
        <boxGeometry args={[4.2, 5.2, 0.35]} />
        <meshStandardMaterial color={p.body} metalness={0.6} roughness={0.35} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={p.edge} />
      </lineSegments>
      <mesh position={[0, 0, 0.19]}>
        <boxGeometry args={[3.9, 4.9, 0.04]} />
        <meshStandardMaterial color={p.plate} roughness={0.8} />
      </mesh>
      {ROWS.map((y, r) => (
        <group key={r}>
          <mesh position={[0, y - 0.42, 0.22]}>
            <boxGeometry args={[3.6, 0.07, 0.05]} />
            <meshStandardMaterial color="#8a97ab" metalness={0.9} roughness={0.3} />
          </mesh>
          {COLS.map((x, c) => (
            <Breaker key={c} x={x} y={y} phase={r * 1.7 + c * 0.9} color={ledColors[(r + c) % ledColors.length]} />
          ))}
        </group>
      ))}
    </group>
  );
}

/* ───────── كابل تسري فيه نبضات تيار ───────── */
function Cable({ points, color, speed, offset }: { points: V3[]; color: string; speed: number; offset: number }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(q[0], q[1], q[2]))),
    [points]
  );
  const pulses = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    pulses.current.forEach((m, i) => {
      if (!m) return;
      const u = (((t - i * 0.03) % 1) + 1) % 1;
      m.position.copy(curve.getPoint(u));
      m.scale.setScalar(1 - i * 0.28);
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 96, 0.028, 8, false]} />
        <meshStandardMaterial color="#0f1a2c" metalness={0.5} roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            pulses.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// (أي لون: 'v' = لون الجهد الأزرق، 's' = اللون الدافئ)
const CABLES: { points: V3[]; c: 'v' | 's'; speed: number; offset: number }[] = [
  { points: [[2.0, 1.65, 0.1], [3.2, 1.9, 0.8], [4.5, 1.2, 1.8], [6, 1.6, 1.0], [8, 0.8, -2]], c: 's', speed: 0.18, offset: 0.1 },
  { points: [[-2.0, 0.55, 0.1], [-3.3, 0.9, 0.7], [-4.6, 0.2, 1.5], [-6.2, 0.9, 0.5], [-8, 0.2, -2]], c: 'v', speed: 0.22, offset: 0.5 },
  { points: [[1.2, -2.6, 0.1], [1.6, -3.0, 1.0], [3, -3.2, 2.0], [5, -2.6, 1.2], [7.5, -2.9, -1.5]], c: 'v', speed: 0.16, offset: 0.3 },
  { points: [[-1.2, 2.6, 0.0], [-1.4, 3.4, 0.8], [-2.6, 4.0, 1.0], [-4.5, 4.3, 0.0], [-7, 4.0, -2]], c: 's', speed: 0.2, offset: 0.7 },
  { points: [[0.4, 2.6, 0.0], [0.6, 3.5, 0.5], [1.8, 4.2, 0.8], [4, 4.4, 0.0], [7, 4.6, -2]], c: 'v', speed: 0.14, offset: 0.9 },
  { points: [[-0.6, -2.6, 0.0], [-1.0, -3.1, 0.8], [-2.6, -3.3, 1.6], [-4.8, -2.8, 0.8], [-7.5, -3.1, -2]], c: 's', speed: 0.19, offset: 0.4 },
];

/* ───────── هالة خلف اللوحة ───────── */
function Glow({ p }: { p: Palette }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, `rgba(${p.glowRGB},${p.glowAlpha})`);
      g.addColorStop(1, `rgba(${p.glowRGB},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(c);
  }, [p.glowRGB, p.glowAlpha]);

  return (
    <mesh position={[0, 0, -1.2]}>
      <planeGeometry args={[11, 11]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={p.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ───────── أرضية شبكية ───────── */
function Floor({ p }: { p: Palette }) {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, p.gridA, p.gridB);
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = p.gridOpacity;
    return g;
  }, [p.gridA, p.gridB, p.gridOpacity]);
  return <primitive object={grid} position={[0, -3.4, 0]} />;
}

/* ───────── غبار كهربائي عائم ───────── */
function Dust({ p }: { p: Palette }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 420;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 22;
      a[i * 3 + 1] = (Math.random() - 0.5) * 12;
      a[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return a;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={p.dust} transparent opacity={p.dustOpacity} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ───────── حركة اللوحة مع الماوس + وضع الجوال ───────── */
function Rig({ p }: { p: Palette }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const wide = viewport.width / viewport.height > 1.1;
  const scale = wide ? 1 : Math.max(0.5, viewport.width / 6.4);
  const baseX = wide ? -viewport.width * 0.2 : 0;
  const baseY = wide ? 0 : viewport.height * 0.2;

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const targetY = (wide ? 0.32 : 0) + pointer.current.x * 0.3 + Math.sin(t * 0.4) * 0.1;
    const targetX = pointer.current.y * 0.15;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, baseX, 4, dt);
    g.position.y = baseY + Math.sin(t * 0.8) * 0.1;
    g.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      <Glow p={p} />
      <Panel p={p} />
      {CABLES.map((c, i) => (
        <Cable key={i} points={c.points} color={c.c === 'v' ? p.volt : p.spark} speed={c.speed} offset={c.offset} />
      ))}
    </group>
  );
}

export default function PanelScene({ theme = 'new' }: { theme?: Theme }) {
  const p = PALETTES[theme];
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <fog attach="fog" args={[p.fog, p.fogNear, p.fogFar]} />
      <ambientLight intensity={p.ambient} />
      <directionalLight position={[3, 4, 5]} intensity={p.sun} color={p.sunColor} />
      <pointLight position={[-4, 1, 3]} intensity={p.voltLight} color={p.volt} distance={14} />
      <pointLight position={[4, -2, 3]} intensity={p.sparkLight} color={p.spark} distance={12} />
      <Floor p={p} />
      <Dust p={p} />
      <Rig p={p} />
    </Canvas>
  );
}
