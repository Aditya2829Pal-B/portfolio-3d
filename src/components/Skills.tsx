"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Line as DreiLine } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const skillCategories = [
  {
    name: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React", level: 95 },
      { name: "Next.js", level: 90 },
      { name: "TypeScript", level: 92 },
      { name: "Tailwind CSS", level: 94 },
      { name: "Framer Motion", level: 88 },
      { name: "GSAP", level: 85 },
    ],
  },
  {
    name: "3D & Graphics",
    color: "#a855f7",
    skills: [
      { name: "Three.js", level: 90 },
      { name: "React Three Fiber", level: 88 },
      { name: "WebGL/GLSL", level: 82 },
      { name: "Blender", level: 75 },
      { name: "Shader Development", level: 85 },
      { name: "Post-processing", level: 80 },
    ],
  },
  {
    name: "Backend & Tools",
    color: "#34d399",
    skills: [
      { name: "Node.js", level: 85 },
      { name: "PostgreSQL", level: 80 },
      { name: "GraphQL", level: 78 },
      { name: "Docker", level: 75 },
      { name: "AWS/Vercel", level: 82 },
      { name: "Git/CI-CD", level: 88 },
    ],
  },
  {
    name: "Design",
    color: "#f472b6",
    skills: [
      { name: "Figma", level: 85 },
      { name: "UI/UX Design", level: 82 },
      { name: "Prototyping", level: 88 },
      { name: "Design Systems", level: 80 },
      { name: "Motion Design", level: 85 },
      { name: "Accessibility", level: 78 },
    ],
  },
];

// 3D Skill Orb
function SkillOrb({
  position,
  color,
  size,
  index,
  onHover,
  onLeave,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  index: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const offset = index * 1.5;
      
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x += 0.001;
      ref.current.position.y = position[1] + Math.sin(time * 0.8 + offset) * 0.3;
      ref.current.position.x = position[0] + Math.cos(time * 0.5 + offset) * 0.2;
    }
  });

  return (
    <mesh
      ref={ref}
      position={position}
      scale={hovered ? size * 1.3 : size}
      onPointerOver={() => { setHovered(true); onHover(); }}
      onPointerOut={() => { setHovered(false); onLeave(); }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.3}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.5}
        thickness={0.5}
        ior={1.3}
        envMapIntensity={2}
        emissive={color}
        emissiveIntensity={hovered ? 0.4 : 0.15}
      />
    </mesh>
  );
}

// Skill Ring Visualization
function SkillRing({ category, index }: { category: typeof skillCategories[0]; index: number }) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const radius = 2.5;

  return (
    <group>
      {category.skills.map((skill, i) => {
        const angle = (i / category.skills.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <group key={skill.name}>
            {/* Connection Line to Center */}
            <DreiLine
              points={[
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(x * 0.7, y * 0.7, 0),
              ] as any}
              color={category.color}
              opacity={0.2}
              linewidth={1}
            />
            
            {/* Skill Orb */}
            <SkillOrb
              position={[x, y, 0]}
              color={category.color}
              size={0.4 + skill.level / 100 * 0.3}
              index={index * 10 + i}
              onHover={() => setHoveredSkill(skill.name)}
              onLeave={() => setHoveredSkill(null)}
            />
            
            {/* Skill Label */}
            <Html
              transform
              position={[x * 1.4, y * 1.4, 0]}
              style={{
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className={cn(
                  "text-white text-sm font-medium text-center whitespace-nowrap transition-all",
                  "px-2 py-1 rounded bg-white/5 border border-white/10 backdrop-blur-sm",
                  hoveredSkill === skill.name && "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 scale-110"
                )}
              >
                {skill.name}
                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden w-20 mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 + i * 0.05 }}
                  />
                </div>
              </motion.div>
            </Html>
          </group>
        );
      })}
      
      {/* Center Category Label */}
      <Html position={[0, 0, 0]} style={{ pointerEvents: "none", transform: "translate(-50%, -50%)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="text-center px-4 py-2"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{ background: `linear-gradient(135deg, ${category.color}CC, ${category.color}44)` }}
          >
            <div className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center"
              style={{ boxShadow: `0 0 30px ${category.color}88` }}
            >
              {category.name.charAt(0)}
            </div>
          </div>
          <div className="text-white font-medium text-lg">{category.name}</div>
          <div className="text-white/50 text-xs mt-1">{category.skills.length} Skills</div>
        </motion.div>
      </Html>
    </group>
  );
}

function SkillsCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#00000000"]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[-5, 5, -5]} intensity={1} color="#00d4ff" />
      <pointLight position={[5, -5, 5]} intensity={1} color="#a855f7" />
      
      {/* Central Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial
          color="#0a0a0f"
          metalness={0.9}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={3}
        />
      </mesh>
      
      {/* Pulsing Core Glow */}
      <mesh position={[0, 0, 0]} scale={1.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Skill Rings */}
      <group rotation={[0, 0, 0]}>
        {skillCategories.map((category, index) => (
          <SkillRing key={category.name} category={category} index={index} />
        ))}
      </group>
      
      {/* Floating Particles */}
      <ParticleField count={500} />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={8}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={0.2}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    const colorChoice = Math.random();
    if (colorChoice < 0.25) {
      colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1; // cyan
    } else if (colorChoice < 0.5) {
      colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.96; // purple
    } else if (colorChoice < 0.75) {
      colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.7; // pink
    } else {
      colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 0.6; // green
    }
    
    sizes[i] = Math.random() * 0.03 + 0.01;
    
    velocities[i * 3] = (Math.random() - 0.5) * 0.001;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.001;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
  }

  useFrame((state) => {
    if (ref.current) {
      const positionsArray = ref.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        // Subtle orbital motion
        const r = Math.sqrt(
          positionsArray[i * 3] ** 2 + 
          positionsArray[i * 3 + 1] ** 2 + 
          positionsArray[i * 3 + 2] ** 2
        );
        
        positionsArray[i * 3] += Math.sin(time + i) * 0.0005;
        positionsArray[i * 3 + 1] += Math.cos(time * 0.7 + i) * 0.0005;
        positionsArray[i * 3 + 2] += Math.sin(time * 0.5 + i) * 0.0005;
        
        // Keep particles in bounds
        const newR = Math.sqrt(
          positionsArray[i * 3] ** 2 + 
          positionsArray[i * 3 + 1] ** 2 + 
          positionsArray[i * 3 + 2] ** 2
        );
        if (newR > 12) {
          const scale = 11 / newR;
          positionsArray[i * 3] *= scale;
          positionsArray[i * 3 + 1] *= scale;
          positionsArray[i * 3 + 2] *= scale;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative py-24 md:py-32 px-6 bg-black/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cyan-400 mb-4">
            Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Technical
            <br />
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Arsenal
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Interactive 3D visualization of my technical skillset. Hover over each orb
            to see proficiency levels and explore the connections between technologies.
          </p>
        </motion.div>

        {/* 3D Skills Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[600px] md:h-[700px] rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <SkillsCanvas />
          </div>
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Legend / Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${category.color}CC, ${category.color}44)` }}
              >
                <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg"
                  style={{ boxShadow: `0 0 20px ${category.color}88` }}
                >
                  {category.name.charAt(0)}
                </div>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">{category.name}</h3>
              <p className="text-white/50 text-sm mb-4">{category.skills.length} technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {category.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill.name}
                    className="px-2 py-1 rounded text-xs font-medium text-white/70"
                    style={{ background: `${category.color}22`, border: `1px solid ${category.color}44` }}
                  >
                    {skill.name}
                  </span>
                ))}
                {category.skills.length > 4 && (
                  <span className="px-2 py-1 rounded text-xs font-medium text-white/40 bg-white/5 border border-white/10">
                    +{category.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}