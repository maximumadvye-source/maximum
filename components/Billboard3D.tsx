'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// @ts-ignore
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// @ts-ignore
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// @ts-ignore
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';

interface Billboard3DProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function Billboard3D({
  title = 'لوحة ثلاثية الأبعاد',
  subtitle = 'تجربة تفاعلية مذهلة',
  imageUrl = 'https://images.unsplash.com/photo-1634986066530-a5a0dbf2cbf1?w=1200',
}: Billboard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<any | null>(null);
  const billboardRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- نفس الكود كما هو (لم يتم تعديله) ---
    // الحفاظ على كل الرسومات والأنيميشن

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060717);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0x8899ff, 0x101225, 0.6);
    scene.add(hemi);

    const fill = new THREE.PointLight(0x44ffcc, 0.6, 20);
    fill.position.set(-6, 2, 3);
    scene.add(fill);

    const rim = new THREE.PointLight(0x7766ff, 0.9, 30);
    rim.position.set(5, -3, 6);
    scene.add(rim);

    const backLight = new THREE.PointLight(0xff44aa, 0.4, 25);
    backLight.position.set(-4, 2, -8);
    scene.add(backLight);

    const accent = new THREE.PointLight(0xff6688, 0.4, 25);
    accent.position.set(-3, -4, 4);
    scene.add(accent);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
      gradient.addColorStop(0, '#1a2f5e');
      gradient.addColorStop(0.5, '#0f1a3a');
      gradient.addColorStop(1, '#030618');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      for (let i = 0; i < 300; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 1.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.6})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const envTexture = new THREE.CanvasTexture(canvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envTexture;
    scene.environment = envTexture;

    const billboard = new THREE.Group();
    billboardRef.current = billboard;
    scene.add(billboard);

    const geometry = new THREE.BoxGeometry(4, 2.25, 0.12);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl);

    const frontMat = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.45,
      metalness: 0.03,
      clearcoat: 0.3,
      clearcoatRoughness: 0.08,
      ior: 1.5,
      reflectivity: 0.8,
      side: THREE.FrontSide,
    });

    const sideMat = new THREE.MeshStandardMaterial({ color: 0x0f1724, roughness: 0.8 });
    const backMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.9 });

    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];

    const mesh = new THREE.Mesh(geometry, materials);
    billboard.add(mesh);

    const glowGeo = new THREE.BoxGeometry(4.1, 2.35, 0.18);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.08 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    billboard.add(glow);

    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.LineSegments(edgeGeo, lineMat);
    billboard.add(wireframe);

    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const angleLerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientY / window.innerHeight - 0.5) * 0.8;
      targetY = (e.clientX / window.innerWidth - 0.5) * 1.2;
    };

    const onScroll = (e: WheelEvent) => {
      scrollY += e.deltaY * 0.0005;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onScroll);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = -Math.random() * 200 - 10;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.035, opacity: 0.9 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { samples: 2 });
    const composer = new EffectComposer(renderer, renderTarget);
    composerRef.current = composer;
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.45, 0.85);
    composer.addPass(bloomPass);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      billboard.position.y = Math.sin(t * 0.6) * 0.12;

      billboard.rotation.x = angleLerp(billboard.rotation.x, targetX * 1.2, 0.08);
      billboard.rotation.y = angleLerp(billboard.rotation.y, targetY * 1.4, 0.08);
      billboard.rotation.z = angleLerp(billboard.rotation.z, targetY * 0.15, 0.05);

      camera.position.x = angleLerp(camera.position.x, targetY * 0.6, 0.05);
      camera.position.y = angleLerp(camera.position.y, (targetX * 0.4) + (scrollY * 0.3), 0.05);
      camera.position.z = 6 + scrollY;
      camera.lookAt(0, 0, 0);

      stars.position.x = -targetY * 6;

      composer.render();
    };

    animate();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-screen bg-dark overflow-hidden relative" ref={containerRef} dir="rtl">
      <div className="absolute top-8 right-8 text-right z-10">
        <h1 className="text-4xl font-bold gradient-text">{title}</h1>
        <p className="text-lg text-gray-400 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}
