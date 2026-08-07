import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Shoe3DCanvasProps {
  accentColor?: string;
  className?: string;
}

export function Shoe3DCanvas({ accentColor = "#00f0ff", className = "" }: Shoe3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7);

    // Renderer setup with alpha
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(accentColor, 2.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const purpleLight = new THREE.DirectionalLight(0x7000ff, 2);
    purpleLight.position.set(-5, -3, -2);
    scene.add(purpleLight);

    // Group for 3D elements
    const group = new THREE.Group();
    scene.add(group);

    // Core Stylized 3D Geometry representing a futuristic footwear sole/body
    const mainGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false,
    });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    group.add(mainMesh);

    // Outer Cyber Ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentColor),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    group.add(ringMesh);

    // 3D Floating Particle Orbit
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: new THREE.Color(accentColor),
      transparent: true,
      opacity: 0.6,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse Tracking for 3D Interactive Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      group.rotation.y += 0.01;
      group.rotation.x = targetY * 0.5;
      group.rotation.z = targetX * 0.3;

      ringMesh.rotation.z += 0.005;
      particleSystem.rotation.y -= 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [accentColor]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing ${className}`}
    />
  );
}
