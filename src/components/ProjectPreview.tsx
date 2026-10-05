"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface ProjectPreviewProps {
  color1: string;
  color2: string;
  type: string;
}

export default function ProjectPreview({ color1, color2, type }: ProjectPreviewProps) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += state.clock.getDelta() * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case "3D & ML":
        return <torusKnotGeometry args={[0.6, 0.2, 64, 16, 2, 3]} />;
      case "Creative Coding":
        return <icosahedronGeometry args={[0.7, 0]} />;
      case "Full Stack":
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case "Generative Art":
        return <sphereGeometry args={[0.7, 32, 32]} />;
      case "E-Commerce":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case "Data Viz":
        return <octahedronGeometry args={[0.7]} />;
      default:
        return <torusGeometry args={[0.6, 0.2, 16, 32]} />;
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <color attach="background" args={["#00000000"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 2]} intensity={2} />
      <pointLight position={[-2, 2, -2]} intensity={1} color={color1} />
      
      <group
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <meshPhysicalMaterial
          color={color1}
          metalness={0.7}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color1}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.9}
          transmission={0.3}
          thickness={0.5}
        />
      </group>
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}