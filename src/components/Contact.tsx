"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, GitBranch, Link, X, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Line as DreiLine } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@developer.dev", href: "mailto:hello@developer.dev" },
  { icon: MapPin, label: "Location", value: "San Francisco, CA", href: "#" },
  { icon: GitBranch, label: "GitHub", value: "@developer", href: "https://github.com" },
  { icon: Link, label: "LinkedIn", value: "in/developer", href: "https://linkedin.com" },
  { icon: X, label: "Twitter", value: "@developer", href: "https://twitter.com" },
];

// Interactive 3D Contact Sphere
function ContactSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      
      // Auto rotation when not hovered
      if (!hovered) {
        ref.current.rotation.y += delta * 0.1;
        ref.current.rotation.x += delta * 0.05;
      }
      
      // Mouse follow when hovered
      if (hovered) {
        ref.current.rotation.y += (mousePos.x * 0.5 - ref.current.rotation.y) * 0.05;
        ref.current.rotation.x += (-mousePos.y * 0.3 - ref.current.rotation.x) * 0.05;
      }
      
      // Subtle breathing animation
      const scale = 1 + Math.sin(time * 1.5) * 0.02;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group
      onPointerMove={(e) => {
        const coords = e.point;
        if (coords) {
          setMousePos({ x: coords.x, y: coords.y });
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Glow Shell */}
      <mesh>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={hovered ? 0.15 : 0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Main Sphere */}
      <mesh
        ref={ref}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshPhysicalMaterial
          color="#0a0a0f"
          metalness={0.9}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={3}
          transmission={0.1}
          thickness={0.5}
        />
      </mesh>
      
      {/* Inner Glow */}
      <mesh>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Floating Ring Particles */}
      <RingParticles count={200} radius={3.5} color="#00d4ff" />
      <RingParticles count={150} radius={4.2} color="#a855f7" speed={-0.3} />
      
      {/* Connection Lines to Contact Items */}
      <ContactLines />
    </group>
  );
}

function RingParticles({ count, radius, color, speed = 0.5 }: { count: number; radius: number; color: string; speed?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const axes = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Random spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    const c = new THREE.Color(color);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    
    sizes[i] = Math.random() * 0.04 + 0.01;
    phases[i] = Math.random() * Math.PI * 2;
    
    // Random rotation axis
    axes[i * 3] = Math.random() - 0.5;
    axes[i * 3 + 1] = Math.random() - 0.5;
    axes[i * 3 + 2] = Math.random() - 0.5;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += state.clock.getDelta() * speed;
      ref.current.rotation.x += state.clock.getDelta() * speed * 0.3;
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

function ContactLines() {
  const contactPositions = [
    { name: "Email", pos: [-5, 3, 0] as [number, number, number] },
    { name: "Location", pos: [-5, 1.5, 0] as [number, number, number] },
    { name: "GitHub", pos: [-5, 0, 0] as [number, number, number] },
    { name: "LinkedIn", pos: [-5, -1.5, 0] as [number, number, number] },
    { name: "Twitter", pos: [-5, -3, 0] as [number, number, number] },
  ];

  return (
    <group>
      {contactPositions.map((contact) => (
        <ContactLine key={contact.name} targetPos={contact.pos} />
      ))}
    </group>
  );
}

function ContactLine({ targetPos }: { targetPos: [number, number, number] }) {
  const ref = useRef<any>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const animatedProgress = (Math.sin(time * 2) + 1) / 2;
      setProgress(animatedProgress);
    }
  });

  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(targetPos[0] * progress, targetPos[1] * progress, targetPos[2] * progress),
  ];

  return (
    <DreiLine
      ref={ref}
      points={points}
      color="#00d4ff"
      opacity={0.3}
      linewidth={2}
      dashed={true}
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

function ContactCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 40 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#00000000"]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={1} color="#00d4ff" />
      <pointLight position={[5, -5, 5]} intensity={1} color="#a855f7" />
      
      <ContactSphere />
      
      {/* Contact Info Labels in 3D */}
      <Html
        transform
        position={[-6, 3, 0]}
        style={{ pointerEvents: "none", transform: "translateY(-50%)" }}
      >
        <div className="text-right pr-4 text-white/80">
          <div className="font-medium">Email</div>
          <div className="text-sm text-white/50">hello@dev.com</div>
        </div>
      </Html>
      <Html
        transform
        position={[-6, 1.5, 0]}
        style={{ pointerEvents: "none", transform: "translateY(-50%)" }}
      >
        <div className="text-right pr-4 text-white/80">
          <div className="font-medium">Location</div>
          <div className="text-sm text-white/50">San Francisco</div>
        </div>
      </Html>
      <Html
        transform
        position={[-6, 0, 0]}
        style={{ pointerEvents: "none", transform: "translateY(-50%)" }}
      >
        <div className="text-right pr-4 text-white/80">
          <div className="font-medium">GitHub</div>
          <div className="text-sm text-white/50">@developer</div>
        </div>
      </Html>
      <Html
        transform
        position={[-6, -1.5, 0]}
        style={{ pointerEvents: "none", transform: "translateY(-50%)" }}
      >
        <div className="text-right pr-4 text-white/80">
          <div className="font-medium">LinkedIn</div>
          <div className="text-sm text-white/50">in/developer</div>
        </div>
      </Html>
      <Html
        transform
        position={[-6, -3, 0]}
        style={{ pointerEvents: "none", transform: "translateY(-50%)" }}
      >
        <div className="text-right pr-4 text-white/80">
          <div className="font-medium">Twitter</div>
          <div className="text-sm text-white/50">@developer</div>
        </div>
      </Html>
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={20}
        autoRotate={true}
        autoRotateSpeed={0.15}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setFormState("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    setTimeout(() => setFormState("idle"), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 px-6 bg-black/30">
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
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Let's Create
            <br />
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Something Amazing
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Have a project in mind? I'm always open to discussing new opportunities,
            collaborations, or just chatting about creative technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Side - 3D Contact Sphere */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-[500px] md:h-[600px] rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <ContactCanvas />
            </div>
            
            {/* Floating Action Hint */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            >
              <div className="text-white/50 text-sm mb-2">Drag to rotate • Scroll to zoom</div>
              <div className="w-8 h-8 mx-auto border-2 border-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              {contactInfo.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:bg-white/10 transition-all"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-white/50 text-sm">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Contact Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-white/70 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
                  placeholder="Project Inquiry"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white/70 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              
              <button
                type="submit"
                disabled={formState === "submitting"}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : formState === "success" ? (
                  <>
                    <Send className="w-5 h-5" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
              
              {formState === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  Something went wrong. Please try again or email directly.
                </motion.p>
              )}
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}