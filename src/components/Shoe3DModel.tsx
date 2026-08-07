import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Shoe3DModelProps {
  color?: string;
  accentColor?: string;
  className?: string;
}

export function Shoe3DModel({
  color = "#0e131f",
  accentColor = "#00f0ff",
  className = "",
}: Shoe3DModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.2, 5.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting for Realistic 3D Footwear Render
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const cyanRimLight = new THREE.DirectionalLight(new THREE.Color(accentColor), 3.0);
    cyanRimLight.position.set(-6, 4, -4);
    scene.add(cyanRimLight);

    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomLight.position.set(0, -5, 2);
    scene.add(bottomLight);

    // 3D FOOTWEAR GROUP (ONLY THE SHOE)
    const shoeGroup = new THREE.Group();
    scene.add(shoeGroup);

    // Materials
    const outsoleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#00f0ff"),
      roughness: 0.3,
      metalness: 0.2,
    });
    const midsoleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f8fafc"),
      roughness: 0.4,
      metalness: 0.1,
    });
    const upperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#111827"),
      roughness: 0.6,
      metalness: 0.1,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(accentColor),
      emissiveIntensity: 0.3,
    });
    const laceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      roughness: 0.8,
    });

    // 1. OUTSOLE (Bottom Tread)
    const outsoleGeo = new THREE.BoxGeometry(2.4, 0.22, 1.1, 16, 4, 16);
    // Sculpt outsole shape (curved toe and heel)
    const pos = outsoleGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let z = pos.getZ(i);
      // Taper back to heel and curve front to toe
      if (x > 0.8) z *= 0.85; // Toe taper
      if (x < -0.8) z *= 0.9; // Heel taper
      pos.setZ(i, z);
    }
    outsoleGeo.computeVertexNormals();
    const outsoleMesh = new THREE.Mesh(outsoleGeo, outsoleMat);
    outsoleMesh.position.y = -0.6;
    shoeGroup.add(outsoleMesh);

    // 2. MIDSOLE (Nitrogen Cushion Layer)
    const midsoleGeo = new THREE.BoxGeometry(2.35, 0.3, 1.05);
    const midsoleMesh = new THREE.Mesh(midsoleGeo, midsoleMat);
    midsoleMesh.position.y = -0.35;
    shoeGroup.add(midsoleMesh);

    // 3. MAIN UPPER BODY
    const upperGeo = new THREE.ConeGeometry(1.2, 2.2, 32);
    upperGeo.rotateZ(-Math.PI / 2);
    upperGeo.scale(1, 0.45, 0.45);
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.set(0.1, 0.05, 0);
    shoeGroup.add(upperMesh);

    // 4. ANKLE COLLAR / HEEL COUNTER (Back of shoe)
    const heelGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.65, 32, 1, false, 0, Math.PI);
    const heelMesh = new THREE.Mesh(heelGeo, upperMat);
    heelMesh.position.set(-0.65, 0.2, 0);
    heelMesh.rotation.y = Math.PI / 2;
    shoeGroup.add(heelMesh);

    // 5. TONGUE & LACES (Front top)
    const tongueGeo = new THREE.BoxGeometry(0.7, 0.45, 0.4);
    tongueGeo.rotateZ(0.2);
    const tongueMesh = new THREE.Mesh(tongueGeo, laceMat);
    tongueMesh.position.set(0.1, 0.35, 0);
    shoeGroup.add(tongueMesh);

    // Laces (cross strips)
    for (let l = -0.1; l <= 0.4; l += 0.15) {
      const laceStripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
      laceStripGeo.rotateX(Math.PI / 2);
      const laceStrip = new THREE.Mesh(laceStripGeo, laceMat);
      laceStrip.position.set(l, 0.38 + l * 0.1, 0);
      shoeGroup.add(laceStrip);
    }

    // 6. SIDE ACCENT SWOOSH / LIGHTNING STRIPE (Lateral & Medial)
    const stripeGeo = new THREE.BoxGeometry(1.4, 0.12, 0.08);
    stripeGeo.rotateZ(-0.25);
    // Lateral (Outer side)
    const stripeLat = new THREE.Mesh(stripeGeo, accentMat);
    stripeLat.position.set(0.05, 0.05, 0.52);
    shoeGroup.add(stripeLat);
    // Medial (Inner side)
    const stripeMed = new THREE.Mesh(stripeGeo, accentMat);
    stripeMed.position.set(0.05, 0.05, -0.52);
    shoeGroup.add(stripeMed);

    // Center shoe group
    shoeGroup.position.set(0, 0, 0);

    // 3D Soft Floor Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.5, 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = Math.PI / 2;
    shadowMesh.position.y = -0.8;
    scene.add(shadowMesh);

    // Interactive Drag to Rotate
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      shoeGroup.rotation.y += deltaX * 0.01;
      shoeGroup.rotation.x += deltaY * 0.01;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Render Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        // Smooth 360-degree rotation showing all sides & angles
        shoeGroup.rotation.y += 0.015;
        shoeGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.15; // gentle pitch roll to reveal sole and top
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor, color]);

  return (
    <div className={`relative w-full h-[400px] flex items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3D Control Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-[#00f0ff]/40 bg-[#0e131f]/90 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold text-[#00f0ff] uppercase tracking-wider shadow-lg pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-[#00f0ff] animate-ping" />
        <span>360° 3D Model • Drag to rotate all angles</span>
      </div>
    </div>
  );
}
