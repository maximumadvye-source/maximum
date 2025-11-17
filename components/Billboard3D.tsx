'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator';

interface Billboard3DProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

export default function Billboard3D({
  title = '3D Billboard',
  subtitle = 'Interactive Experience',
  imageUrl = 'https://images.unsplash.com/photo-1634986066530-a5a0dbf2cbf1?w=1200',
}: Billboard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const billboardRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060717);

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 0, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights: ambient + hemisphere + colored rim lights
    const hemi = new THREE.HemisphereLight(0x8899ff, 0x101225, 0.6);
    scene.add(hemi);

    const fill = new THREE.PointLight(0x44ffcc, 0.6, 20);
    fill.position.set(-6, 2, 3);
    scene.add(fill);

    const rim = new THREE.PointLight(0x7766ff, 0.9, 30);
    rim.position.set(5, -3, 6);
    scene.add(rim);

    // Additional edge highlight from back
    const backLight = new THREE.PointLight(0xff44aa, 0.4, 25);
    backLight.position.set(-4, 2, -8);
    scene.add(backLight);

    // Additional accent light for dramatic effect
    const accent = new THREE.PointLight(0xff6688, 0.4, 25);
    accent.position.set(-3, -4, 4);
    scene.add(accent);

    // Generate procedural environment map for reflections
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
      
      // Add subtle noise/stars pattern
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

    // Billboard group
    const billboard = new THREE.Group();
    billboardRef.current = billboard;
    scene.add(billboard);

    // Geometry and improved materials
    const geometry = new THREE.BoxGeometry(4, 2.25, 0.12);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl, () => {
      // nothing here, we'll render via composer
    });

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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    billboard.add(mesh);

    // Soft rim glow mesh (slightly larger, additive)
    const glowGeo = new THREE.BoxGeometry(4.1, 2.35, 0.18);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.08 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    billboard.add(glow);

    // Add edge lines for extra visual interest
    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x667eea, transparent: true, opacity: 0.3, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgeGeo, lineMat);
    billboard.add(wireframe);

    // Subtle floating motion and rotation smoothing
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientY / window.innerHeight - 0.5) * 0.8; // pitch
      targetY = (e.clientX / window.innerWidth - 0.5) * 1.2; // yaw
    };

    const onScroll = (e: WheelEvent) => {
      scrollY += e.deltaY * 0.0005;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onScroll);

    // Stars background (denser, subtle)
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = -Math.random() * 200 - 10; // behind
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Postprocessing (bloom)
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      samples: 2,
    });
    const composer = new EffectComposer(renderer, renderTarget);
    composerRef.current = composer;
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.45, 0.85);
    bloomPass.threshold = 0.15;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.8;
    composer.addPass(bloomPass);

    // Animation
    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // floating
      billboard.position.y = Math.sin(t * 0.6) * 0.12;

      // smooth rotation towards mouse target (more responsive)
      if (billboard) {
        billboard.rotation.x = lerp(billboard.rotation.x, targetX * 1.2, 0.08);
        billboard.rotation.y = lerp(billboard.rotation.y, targetY * 1.4, 0.08);
        billboard.rotation.z = lerp(billboard.rotation.z, targetY * 0.15, 0.05);
      }

      // Camera subtle movement based on mouse & scroll
      camera.position.x = lerp(camera.position.x, targetY * 0.6, 0.05);
      camera.position.y = lerp(camera.position.y, (targetX * 0.4) + (scrollY * 0.3), 0.05);
      camera.position.z = 6 + scrollY;
      camera.lookAt(0, 0, 0);

      // tiny parallax for stars
      stars.position.x = -targetY * 6;
      stars.rotation.y = t * 0.002;

      // Render with composer for bloom
      composer.render();
    };

    animate();

    // Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      containerRef.current?.removeChild(renderer.domElement);

      // dispose
      geometry.dispose();
      edgeGeo.dispose();
      frontMat.dispose && frontMat.dispose();
      sideMat.dispose && sideMat.dispose();
      backMat.dispose && backMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      lineMat.dispose && lineMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      texture.dispose && texture.dispose();
      composer.dispose();
      renderTarget.dispose && renderTarget.dispose();
      renderer.dispose();
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-screen bg-dark overflow-hidden relative" ref={containerRef}>
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-4xl font-bold gradient-text">{title}</h1>
        <p className="text-lg text-gray-400 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}
