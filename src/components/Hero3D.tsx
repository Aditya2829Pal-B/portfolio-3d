"use client";

import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  ContactShadows,
  Environment,
  useGLTF,
  Stars,
} from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

// ============================================
// SHADER DEFINITIONS
// ============================================

// Morphing Geometry Shader
const morphingVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uNoiseScale;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  
  // Simplex 3D Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Morphing animation using noise
    float noise = snoise(position * uNoiseScale + uTime * 0.3);
    float morph = sin(uTime * 0.5 + noise * 3.0) * uMorphFactor;
    
    vec3 morphedPosition = position + normal * morph * (1.0 + noise * 0.5);
    vElevation = noise;
    
    vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const morphingFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uFresnelPower;
  uniform float uFresnelIntensity;
  
  void main() {
    // Fresnel effect
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower) * uFresnelIntensity;
    
    // Color based on elevation and time
    float colorMix = (vElevation + 1.0) * 0.5;
    colorMix += sin(uTime * 0.8 + vPosition.x * 2.0) * 0.1;
    
    vec3 color = mix(uColorA, uColorB, colorMix);
    color = mix(color, uColorC, smoothstep(0.7, 1.0, colorMix));
    
    // Add fresnel glow
    color += vec3(fresnel) * uColorC;
    
    // Subtle pulsing
    float pulse = sin(uTime * 2.0 + vPosition.y * 3.0) * 0.05 + 0.95;
    color *= pulse;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

// Holographic Shader
const holographicVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
    // Subtle vertex animation
    vec3 pos = position + normal * sin(uTime * 2.0 + position.x * 10.0 + position.y * 10.0) * 0.02;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const holographicFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uScanlineIntensity;
  uniform float uGlitchIntensity;
  
  // Rainbow/iridescent function
  vec3 iridescence(float n) {
    float r = sin(n * 6.2831);
    float g = sin(n * 6.2831 + 2.094);
    float b = sin(n * 6.2831 + 4.188);
    return vec3(r, g, b) * 0.5 + 0.5;
  }
  
  void main() {
    vec3 viewDir = normalize(-vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
    
    // Base holographic color
    float hue = fract(vWorldPosition.x * 0.5 + vWorldPosition.y * 0.3 + uTime * 0.1);
    vec3 color = mix(uBaseColor, uHighlightColor, fresnel);
    color = mix(color, iridescence(hue), fresnel * 0.5);
    
    // Scanline effect
    float scanlines = sin(vWorldPosition.y * 50.0 + uTime * 10.0) * uScanlineIntensity;
    color += vec3(scanlines) * 0.1;
    
    // Glitch effect
    float glitch = step(0.98, fract(uTime * 10.0 + vWorldPosition.x * 5.0)) * uGlitchIntensity;
    color = mix(color, vec3(1.0, 0.0, 1.0), glitch);
    
    // Alpha based on fresnel
    float alpha = 0.3 + fresnel * 0.7;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Plasma Shader
const plasmaVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const plasmaFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  
  float plasma(vec2 uv, float time) {
    float value = 0.0;
    value += sin(uv.x * 10.0 + time) * 0.5;
    value += sin(uv.y * 10.0 + time * 1.3) * 0.5;
    value += sin((uv.x + uv.y) * 8.0 + time * 0.7) * 0.5;
    value += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 15.0 + time * 1.5) * 0.5;
    return value * 0.5 + 0.5;
  }
  
  void main() {
    vec2 uv = vPosition.xz * 2.0;
    float time = uTime * 0.5;
    
    float p = plasma(uv, time);
    float p2 = plasma(uv * 2.0 + time * 0.3, time * 1.7);
    float p3 = plasma(uv * 0.5 - time * 0.2, time * 0.8);
    
    float combined = (p + p2 * 0.5 + p3 * 0.25) / 1.75;
    
    // Four-color gradient
    vec3 color1 = mix(uColorA, uColorB, combined);
    vec3 color2 = mix(uColorC, uColorD, combined);
    vec3 finalColor = mix(color1, color2, vPosition.y * 0.5 + 0.5);
    
    // Add vertical gradient
    finalColor *= (vPosition.y * 0.3 + 0.7);
    
    // Fresnel glow
    float fresnel = pow(1.0 - abs(vNormal.y), 3.0);
    finalColor += vec3(fresnel) * uColorD * 0.5;
    
    gl_FragColor = vec4(finalColor, 0.85);
  }
`;

function MorphingGeometryScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [morphFactor, setMorphFactor] = useState(0.3);
  const [wireframe, setWireframe] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
      
      // Animate morph factor
      const targetMorph = 0.2 + Math.sin(time * 0.5) * 0.15;
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uMorphFactor.value = targetMorph;
      mat.uniforms.uTime.value = time;
    }
  });

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: morphingVertexShader,
    fragmentShader: morphingFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMorphFactor: { value: 0.3 },
      uNoiseScale: { value: 1.5 },
      uColorA: { value: new THREE.Color(0x00d4ff) },
      uColorB: { value: new THREE.Color(0xa855f7) },
      uColorC: { value: new THREE.Color(0xf472b6) },
      uFresnelPower: { value: 3.0 },
      uFresnelIntensity: { value: 0.5 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    wireframe: false,
  }), []);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.5, 64), []);

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
      
      {/* Wireframe overlay */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#00ffff"
          wireframe
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Inner glow core */}
      <mesh geometry={new THREE.SphereGeometry(1.2, 32, 32)}>
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ============================================
// SCENE 2: Particle Galaxy / Nebula
// ============================================

function ParticleGalaxy() {
  const ref = useRef<THREE.Points>(null);
  const count = 15000;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const armIndices = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spiral galaxy arms
      const arm = Math.floor(Math.random() * 4);
      armIndices[i] = arm;
      const armOffset = (arm / 4) * Math.PI * 2;
      
      const radius = Math.pow(Math.random(), 0.5) * 8;
      const theta = radius * 1.5 + armOffset + (Math.random() - 0.5) * 0.5;
      const phi = (Math.random() - 0.5) * 0.8;
      
      arr[i * 3] = Math.cos(theta) * radius * Math.cos(phi);
      arr[i * 3 + 1] = Math.sin(phi) * radius * 0.5;
      arr[i * 3 + 2] = Math.sin(theta) * radius * Math.cos(phi);
      
      // Color by arm
      const hue = (arm / 4) * 0.3 + 0.55; // Cyan to purple range
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 1.5 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
      
      // Orbital velocity
      const orbitSpeed = 0.02 / Math.max(radius, 0.5);
      velocities[i * 3] = -Math.sin(theta) * orbitSpeed;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = Math.cos(theta) * orbitSpeed;
    }
    return { positions: arr, colors, sizes, velocities, phases, armIndices };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      const vel = positions.velocities;
      const phases = positions.phases;
      
      ref.current.rotation.y += 0.0001;
      
      for (let i = 0; i < count; i++) {
        // Orbital motion
        pos[i * 3] += vel[i * 3];
        pos[i * 3 + 2] += vel[i * 3 + 2];
        
        // Vertical oscillation
        pos[i * 3 + 1] = Math.sin(time * 0.5 + phases[i]) * 0.5 * 
          (1 - Math.abs(pos[i * 3]) / 8);
        
        // Size pulsing
        const sizeAttr = ref.current.geometry.attributes.size as THREE.BufferAttribute;
        sizeAttr.array[i] = positions.sizes[i] * (0.8 + Math.sin(time * 2 + phases[i]) * 0.2);
        sizeAttr.needsUpdate = true;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[positions.sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ============================================
// SCENE 3: Geometric Field with Instanced Meshes
// ============================================

function GeometricField() {
  const dummy = useRef(new THREE.Object3D());
  const count = 500;
  const instancedMeshRefs = useRef<THREE.InstancedMesh[]>([]);

  const geometries = useMemo(() => [
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.BoxGeometry(1, 1, 1),
  ], []);

  return (
    <group>
      {geometries.map((geo, g) => (
        <instancedMesh
          key={g}
          ref={(el) => { instancedMeshRefs.current[g] = el!; }}
          args={[geo, new THREE.MeshPhysicalMaterial(), count]}
        >
          <meshPhysicalMaterial
            color={["#00d4ff", "#a855f7", "#f472b6", "#34d399"][g]}
            metalness={0.7}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.3}
            thickness={0.5}
            envMapIntensity={2}
          />
        </instancedMesh>
      ))}
    </group>
  );
}

// ============================================
// SCENE 4: Torus Knot Field (Enhanced Original)
// ============================================

function TorusKnotField() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001;
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Multiple Torus Knots */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} castShadow receiveShadow position={[(i - 1) * 3.5, 0, 0]}>
          <torusKnotGeometry args={[1 + i * 0.3, 0.3, 100, 16, 2 + i, 3]} />
          <meshPhysicalMaterial
            color={["#00d4ff", "#a855f7", "#f472b6"][i]}
            metalness={0.8}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.4}
            thickness={0.5}
            ior={1.5}
            envMapIntensity={2}
            emissive={["#00d4ff", "#a855f7", "#f472b6"][i]}
            emissiveIntensity={hovered ? 0.2 : 0.05}
          />
        </mesh>
      ))}
      
      {/* Connecting particle streams */}
      <ParticleStreams count={300} />
    </group>
  );
}

function ParticleStreams({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const lifetimes = useMemo(() => new Float32Array(count), [count]);

  useMemo(() => {
    for (let i = 0; i < count; i++) {
      const stream = Math.floor(i / (count / 3));
      const t = (i % (count / 3)) / (count / 3);
      const angle = t * Math.PI * 4;
      const radius = 1.5 + t * 2;
      
      positions[i * 3] = (stream - 1) * 3.5 + Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle * 2) * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      const color = new THREE.Color(["#00d4ff", "#a855f7", "#f472b6"][stream]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.08 + 0.02;
      lifetimes[i] = Math.random();
    }
  }, [count, positions, colors, sizes, lifetimes]);

  useFrame((state) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const stream = Math.floor(i / (count / 3));
        const t = (i % (count / 3)) / (count / 3);
        const angle = t * Math.PI * 4 + time * (0.5 + stream * 0.2);
        const radius = 1.5 + t * 2;
        
        pos[i * 3] = (stream - 1) * 3.5 + Math.cos(angle) * radius;
        pos[i * 3 + 1] = Math.sin(angle * 2 + time) * 0.5;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================
// SCENE 5: Fluid Simulation / Metaballs
// ============================================

const metaballVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const metaballFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  
  // Metaball field function
  float metaball(vec3 p, vec3 center, float radius) {
    return radius * radius / dot(p - center, p - center);
  }
  
  void main() {
    vec3 pos = vWorldPosition;
    
    // Animated metaball centers
    vec3 c1 = vec3(sin(uTime * 0.7) * 1.5, sin(uTime * 0.5) * 1.0, cos(uTime * 0.3) * 1.5);
    vec3 c2 = vec3(cos(uTime * 0.6) * 1.5, cos(uTime * 0.8) * 1.0, sin(uTime * 0.4) * 1.5);
    vec3 c3 = vec3(sin(uTime * 0.9) * 1.0, sin(uTime * 1.1) * 1.5, cos(uTime * 0.5) * 1.0);
    vec3 c4 = vec3(0.0, sin(uTime * 0.4) * 2.0, 0.0);
    
    float field = 0.0;
    field += metaball(pos, c1, 1.8);
    field += metaball(pos, c2, 1.5);
    field += metaball(pos, c3, 1.3);
    field += metaball(pos, c4, 2.0);
    
    // Smooth threshold
    float iso = smoothstep(0.9, 1.1, field);
    
    // Color based on which metaball influences most
    float d1 = metaball(pos, c1, 1.8);
    float d2 = metaball(pos, c2, 1.5);
    float d3 = metaball(pos, c3, 1.3);
    float d4 = metaball(pos, c4, 2.0);
    
    vec3 color = mix(uColorA, uColorB, d2 / (d1 + d2 + d3 + d4 + 0.001));
    color = mix(color, uColorC, d3 / (d1 + d2 + d3 + d4 + 0.001));
    color = mix(color, uColorA, d4 / (d1 + d2 + d3 + d4 + 0.001));
    
    // Fresnel
    float fresnel = pow(1.0 - abs(dot(vNormal, normalize(pos))), 2.5) * 0.5;
    color += vec3(fresnel) * uColorC;
    
    gl_FragColor = vec4(color, iso * 0.9);
    
    // Discard invisible parts
    if (iso < 0.05) discard;
  }
`;

function MetaballScene() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: metaballVertexShader,
    fragmentShader: metaballFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x00d4ff) },
      uColorB: { value: new THREE.Color(0xa855f7) },
      uColorC: { value: new THREE.Color(0xf472b6) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  }), []);

  useFrame((state) => {
    (material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
  });

  // Use a sphere geometry that encompasses all metaballs
  return (
    <mesh geometry={new THREE.SphereGeometry(4, 64, 64)} material={material} />
  );
}

// ============================================
// MAIN HERO CANVAS WITH SCENE SELECTOR
// ============================================

type SceneType = 'morphing' | 'galaxy' | 'geometric' | 'torus-field' | 'metaballs' | 'holographic' | 'plasma';

function HeroCanvas() {
  const [activeScene, setActiveScene] = useState<SceneType>('morphing');
  const [showSceneSelector, setShowSceneSelector] = useState(false);

  // Auto-cycle scenes every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const scenes: SceneType[] = ['morphing', 'galaxy', 'geometric', 'torus-field', 'metaballs', 'holographic', 'plasma'];
      const currentIndex = scenes.indexOf(activeScene);
      setActiveScene(scenes[(currentIndex + 1) % scenes.length]);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeScene]);

  const SceneComponent = {
    morphing: MorphingGeometryScene,
    galaxy: OptimizedParticleGalaxy,
    geometric: GeometricField,
    'torus-field': TorusKnotField,
    metaballs: MetaballScene,
    holographic: HolographicScene,
    plasma: PlasmaScene,
  }[activeScene];

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      shadows
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#0a0a0f"]} />
      
      {/* Environment & Lighting */}
      <Environment preset="city" background={false} />
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[5, 10, 7]} intensity={2} castShadow>
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15, 0.1, 50]} />
      </directionalLight>
      <pointLight position={[-8, 8, -8]} intensity={2} color="#00d4ff" />
      <pointLight position={[8, -8, 8]} intensity={1.5} color="#a855f7" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#f472b6" />
      
      <ContactShadows opacity={0.2} scale={30} blur={3} />
      
      {/* Active Scene */}
      <SceneComponent />
      
      {/* Stars Background */}
      <Stars radius={80} depth={100} count={5000} factor={4} saturation={0} />
      
      {/* Orbit Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={0.2}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      {/* Post-processing disabled - not available in current @react-three/drei version */}
      {/* <effectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.1} height={0.3} intensity={0.4} />
        <ChromaticAberration offset={[0.001, 0.001]} />
        <Vignette offset={0.3} darkness={0.4} />
        <Noise opacity={0.02} />
      </effectComposer> */}
    </Canvas>
  );
}

// ============================================
// ADDITIONAL SCENE COMPONENTS
// ============================================

// Holographic Scene
function HolographicScene() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: holographicVertexShader,
    fragmentShader: holographicFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(0x00d4ff) },
      uHighlightColor: { value: new THREE.Color(0xa855f7) },
      uScanlineIntensity: { value: 0.15 },
      uGlitchIntensity: { value: 0.05 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state) => {
    (material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <group>
      <mesh geometry={new THREE.SphereGeometry(2.5, 64, 64)} material={material} />
      <mesh geometry={new THREE.SphereGeometry(1.5, 32, 32)}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      <HolographicRings />
      <HolographicParticles count={500} />
    </group>
  );
}

function HolographicRings() {
  const ringRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.x = Math.sin(time * 0.5 + i) * 0.5;
        ring.rotation.y = time * 0.1 * (i + 1);
        ring.rotation.z = Math.cos(time * 0.3 + i) * 0.3;
      }
    });
  });

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el!; }}
          geometry={new THREE.RingGeometry(3 + i * 0.8, 3.2 + i * 0.8, 64)}
          material={new THREE.MeshBasicMaterial({
            color: ["#00d4ff", "#a855f7", "#f472b6"][i],
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          })}
        />
      ))}
    </group>
  );
}

function HolographicParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const phases = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) { colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1; }
      else if (colorChoice < 0.66) { colors[i * 3] = 0.66; colors[i * 3 + 1] = 0.33; colors[i * 3 + 2] = 0.96; }
      else { colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.7; }
      
      sizes[i] = Math.random() * 0.05 + 0.02;
      phases[i] = Math.random() * Math.PI * 2;
    }
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2);
        const theta = Math.atan2(pos[i * 3], pos[i * 3 + 2]);
        const phi = Math.asin(pos[i * 3 + 1] / r);
        
        const newTheta = theta + 0.0005 * (1 + Math.sin(phases[i]));
        const newPhi = phi + 0.0003 * Math.cos(phases[i]);
        
        pos[i * 3] = r * Math.sin(newPhi) * Math.cos(newTheta);
        pos[i * 3 + 1] = r * Math.sin(newPhi) * Math.sin(newTheta);
        pos[i * 3 + 2] = r * Math.cos(newPhi);
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
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Plasma Scene
function PlasmaScene() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: plasmaVertexShader,
    fragmentShader: plasmaFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x00d4ff) },
      uColorB: { value: new THREE.Color(0xa855f7) },
      uColorC: { value: new THREE.Color(0xf472b6) },
      uColorD: { value: new THREE.Color(0x34d399) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  }), []);

  useFrame((state) => {
    (material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <group>
      <mesh geometry={new THREE.SphereGeometry(3, 64, 64)} material={material} />
      <mesh geometry={new THREE.SphereGeometry(1.5, 32, 32)}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      <PlasmaTendrils count={8} />
    </group>
  );
}

function PlasmaTendrils({ count }: { count: number }) {
  return (
    <group>
      {[...Array(count)].map((_, i) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.sin(i / count * Math.PI * 2) * 3, Math.random() * 4 - 2, Math.cos(i / count * Math.PI * 2) * 3),
          new THREE.Vector3(Math.sin(i / count * Math.PI * 2) * 5, Math.random() * 6 - 3, Math.cos(i / count * Math.PI * 2) * 5),
        ]);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
        const material = new THREE.MeshBasicMaterial({
          color: ["#00d4ff", "#a855f7", "#f472b6", "#34d399"][i % 4],
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        return <mesh key={i} geometry={geometry} material={material} />;
      })}
    </group>
  );
}

// Optimized Particle Galaxy
function OptimizedParticleGalaxy() {
  const ref = useRef<THREE.Points>(null);
  const count = 20000;

  const { positions, colors, sizes, velocities, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const vel = new Float32Array(count * 3);
    const pha = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 5);
      const armOffset = (arm / 5) * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.4) * 10;
      const theta = radius * 2 + armOffset + (Math.random() - 0.5) * 0.3;
      const phi = (Math.random() - 0.5) * 1.2;
      
      pos[i * 3] = Math.cos(theta) * radius * Math.cos(phi);
      pos[i * 3 + 1] = Math.sin(phi) * radius * 0.3;
      pos[i * 3 + 2] = Math.sin(theta) * radius * Math.cos(phi);
      
      const hue = 0.55 + (arm / 5) * 0.3 + (radius / 10) * 0.1;
      const saturation = 0.6 + Math.random() * 0.3;
      const lightness = 0.4 + Math.random() * 0.3;
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
      
      siz[i] = Math.random() * 2 + 0.5;
      pha[i] = Math.random() * Math.PI * 2;
      
      const orbitSpeed = 0.015 / Math.max(radius * 0.5, 0.5);
      vel[i * 3] = -Math.sin(theta) * orbitSpeed;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.001;
      vel[i * 3 + 2] = Math.cos(theta) * orbitSpeed;
    }
    return { positions: pos, colors: col, sizes: siz, velocities: vel, phases: pha };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      ref.current.rotation.y += 0.00005;
      ref.current.rotation.x = Math.sin(time * 0.1) * 0.05;
      
      for (let i = 0; i < count; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];
        pos[i * 3 + 1] += Math.sin(time * 0.5 + phases[i]) * 0.002;
        
        const sizeAttr = ref.current.geometry.attributes.size as THREE.BufferAttribute;
        sizeAttr.array[i] = sizes[i] * (0.7 + Math.sin(time * 3 + phases[i]) * 0.3);
        sizeAttr.needsUpdate = true;
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
      <pointsMaterial size={1.5} vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ============================================
// EXPORT DEFAULT HERO3D COMPONENT
// ============================================

export default function Hero3D() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Canvas Container */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70 text-lg">Loading 3D Scene...</p>
            </div>
          </div>
        }>
          <HeroCanvas />
        </Suspense>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-10 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Scene Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {['morphing', 'galaxy', 'geometric', 'torus-field', 'metaballs', 'holographic', 'plasma'].map((scene, i) => (
          <motion.div
            key={scene}
            className={`w-2 h-2 rounded-full transition-all ${
              i === 0 ? 'bg-cyan-400 w-6' : 'bg-white/30'
            }`}
            animate={{ scale: i === 0 ? 1.2 : 1 }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-white/80">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Available for freelance & collaborations
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 leading-tight"
          >
            <span className="font-extralight">Creative</span>{" "}
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Developer
            </span>{" "}
            <span className="font-extralight">& Designer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 font-light leading-relaxed"
          >
            Crafting immersive digital experiences through code, 3D graphics,
            and thoughtful design. Building the future of the web.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#work"
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              View Work
            </a>
            <a
              href="#contact"
              className="px-8 py-4 rounded-full border border-white/20 text-white/90 font-medium transition-all hover:bg-white/5 hover:border-white/30 backdrop-blur-sm"
            >
              Get In Touch
            </a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 flex flex-col items-center gap-3 text-white/50"
          >
            <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-10 flex flex-col items-center justify-end"
            >
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <div className="w-1 h-1 rounded-full bg-white/30 mt-1" />
              <div className="w-1 h-1 rounded-full bg-white/10 mt-1" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}