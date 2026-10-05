"use client";

import { motion } from "framer-motion";
import { Code, Palette, Box, Globe, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { value: "50+", label: "Projects Completed" },
  { value: "3+", label: "Years Experience" },
  { value: "15+", label: "Technologies" },
  { value: "100%", label: "Client Satisfaction" },
];

const skills = [
  { name: "React & Next.js", icon: Code, color: "from-cyan-400 to-blue-500" },
  { name: "Three.js & R3F", icon: Box, color: "from-purple-400 to-pink-500" },
  { name: "UI/UX Design", icon: Palette, color: "from-pink-400 to-rose-500" },
  { name: "WebGL & Shaders", icon: Zap, color: "from-orange-400 to-red-500" },
  { name: "TypeScript", icon: Code, color: "from-blue-400 to-indigo-500" },
  { name: "Creative Coding", icon: Sparkles, color: "from-green-400 to-teal-500" },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 px-6 bg-black/50">
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
            About Me
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Crafting Digital
            <br />
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experiences
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            I'm a creative developer passionate about building immersive web experiences
            that push the boundaries of what's possible in the browser.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-6">
              <p className="text-white/70 leading-relaxed text-lg">
                With over 3 years of experience in creative development, I specialize in
                transforming complex ideas into elegant, performant, and visually stunning
                web applications.
              </p>
              <p className="text-white/60 leading-relaxed">
                My expertise spans the full spectrum of modern web development — from
                architecting scalable React applications to crafting custom WebGL shaders
                and 3D experiences that captivate users. I believe the best digital
                experiences live at the intersection of technical excellence and artistic vision.
              </p>
              <p className="text-white/60 leading-relaxed">
                When I'm not coding, you'll find me exploring new rendering techniques,
                contributing to open-source projects, or experimenting with generative art.
              </p>

              {/* Tech Stack */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-white font-medium mb-4">Technologies & Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React", "Next.js", "Three.js", "React Three Fiber",
                    "TypeScript", "Tailwind CSS", "Framer Motion",
                    "GSAP", "WebGL", "GLSL", "Blender", "Figma",
                    "Node.js", "PostgreSQL", "Vercel", "Git"
                  ].map((tech) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.random() * 0.3 }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Stats & Skills */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm font-light">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-white font-medium mb-4">Core Expertise</h3>
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    `bg-gradient-to-br ${skill.color}`
                  )}>
                    <skill.icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-white font-medium text-lg">{skill.name}</span>
                  <motion.div
                    className="ml-auto h-1 w-24 bg-white/10 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ width: "90%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}