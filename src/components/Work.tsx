"use client";

import { motion } from "framer-motion";
import { GitBranch, ExternalLink, Play, Code, Palette, Box, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const ProjectPreview = dynamic(() => import("./ProjectPreview"), { ssr: false });

const projects = [
  {
    id: 1,
    title: "Neural Network Visualizer",
    description: "Interactive 3D visualization of neural network architectures with real-time training visualization.",
    image: "🧠",
    tags: ["React Three Fiber", "WebGL", "TensorFlow.js", "GSAP"],
    category: "3D & ML",
    color: "from-cyan-500 to-blue-600",
    links: { github: "#", demo: "#" },
    featured: true,
  },
  {
    id: 2,
    title: "Immersive Portfolio Template",
    description: "Award-winning portfolio template featuring custom shaders, smooth animations, and 3D interactions.",
    image: "🎨",
    tags: ["Next.js", "Three.js", "Tailwind", "Framer Motion"],
    category: "Creative Coding",
    color: "from-purple-500 to-pink-500",
    links: { github: "#", demo: "#" },
    featured: true,
  },
  {
    id: 3,
    title: "Real-time Collaboration Tool",
    description: "Multi-user collaborative workspace with live cursors, presence, and conflict-free editing.",
    image: "👥",
    tags: ["React", "WebRTC", "Yjs", "Node.js", "PostgreSQL"],
    category: "Full Stack",
    color: "from-green-500 to-teal-500",
    links: { github: "#", demo: "#" },
    featured: false,
  },
  {
    id: 4,
    title: "Generative Art Engine",
    description: "Procedural art generator using custom GLSL shaders with export capabilities for print and web.",
    image: "✨",
    tags: ["WebGL", "GLSL", "Three.js", "Canvas API"],
    category: "Generative Art",
    color: "from-orange-500 to-red-500",
    links: { github: "#", demo: "#" },
    featured: true,
  },
  {
    id: 5,
    title: "E-commerce 3D Configurator",
    description: "Product customization with real-time 3D rendering, AR preview, and dynamic pricing.",
    image: "🛍️",
    tags: ["React Three Fiber", "AR.js", "Stripe", "Commerce.js"],
    category: "E-Commerce",
    color: "from-pink-500 to-rose-500",
    links: { github: "#", demo: "#" },
    featured: false,
  },
  {
    id: 6,
    title: "Data Visualization Dashboard",
    description: "Interactive dashboard with 3D charts, real-time updates, and customizable views.",
    image: "📊",
    tags: ["D3.js", "Three.js", "WebSockets", "TypeScript"],
    category: "Data Viz",
    color: "from-indigo-500 to-purple-500",
    links: { github: "#", demo: "#" },
    featured: false,
  },
];

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10",
        "hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-500",
        "flex flex-col h-full"
      )}
      style={{
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? "0 30px 60px -10px rgba(6, 182, 212, 0.15)" : "none",
      }}
    >
      {/* 3D Preview */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${project.color.replace("from-", "").replace("to-", "")})`, opacity: 0.1 }} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <ProjectPreview
            color1={project.color.split(" ")[0].replace("from-", "")}
            color2={project.color.split(" ")[1].replace("to-", "")}
            type={project.category}
          />
        </div>
        
        {/* Featured Badge */}
        {project.featured && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-medium"
          >
            Featured
          </motion.div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium">
          {project.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{project.image}</span>
          <h3 className="text-xl font-medium text-white group-hover:text-cyan-400 transition-colors">
            {project.title}
          </h3>
        </div>

        <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs font-medium">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <a
            href={project.links.github}
            className="group flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-colors"
          >
            <GitBranch className="w-5 h-5" />
            <span className="text-sm font-medium">Code</span>
          </a>
          <a
            href={project.links.demo}
            className="group flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-colors ml-auto"
          >
            <span className="text-sm font-medium">Live Demo</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Glow Effect on Hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${project.color.replace("from-", "").replace("to-", "")})`,
          opacity: hovered ? 0.1 : 0,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: hovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.article>
  );
}

export default function Work() {
  return (
    <section id="work" className="relative py-24 md:py-32 px-6 bg-black/30">
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
            Selected Work
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Projects &
            <br />
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experiments
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            A collection of projects showcasing creative coding, 3D web experiences,
            and full-stack applications.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {["All", "3D & ML", "Creative Coding", "Full Stack", "Generative Art", "E-Commerce", "Data Viz"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/30 transition-all"
          >
            View All Projects
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}