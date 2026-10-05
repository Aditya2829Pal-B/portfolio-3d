"use client";

import { motion } from "framer-motion";
import { GitBranch, Link, X, Mail, MapPin, Heart, Code, Palette, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  navigate: [
    { label: "Home", href: "#" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com", icon: GitBranch },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Link },
    { label: "Twitter", href: "https://twitter.com", icon: X },
    { label: "Email", href: "mailto:hello@developer.dev", icon: Mail },
  ],
  resources: [
    { label: "Resume", href: "#" },
    { label: "Case Studies", href: "#" },
    { label: "Open Source", href: "#" },
    { label: "Blog", href: "#" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 px-6 bg-black/50 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-purple-500">
                <span className="font-bold text-white text-base">CD</span>
              </div>
              <span className="font-light text-xl text-white">Creative Dev</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Crafting immersive digital experiences through code, 3D graphics, and thoughtful design.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white font-medium mb-4">Navigate</h4>
            <nav className="space-y-3">
              {footerLinks.navigate.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="block text-white/60 hover:text-cyan-400 text-sm font-medium transition-colors"
                  whileHover={{ x: 4 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <nav className="space-y-3">
              {footerLinks.resources.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="block text-white/60 hover:text-cyan-400 text-sm font-medium transition-colors"
                  whileHover={{ x: 4 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-white font-medium mb-4">Get In Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <a href="mailto:hello@developer.dev" className="hover:text-cyan-400 transition-colors">hello@developer.dev</a>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Available for freelance</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm"
          >
            © {currentYear} Creative Dev. All rights reserved.
          </motion.p>

          {/* Made With Love */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-white/40 text-sm"
          >
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-red-400"
            >
              <Heart className="w-4 h-4" fill="currentColor" stroke="none" />
            </motion.span>
            <span>and</span>
            <Code className="w-4 h-4 text-cyan-400" strokeWidth={2} />
            <Palette className="w-4 h-4 text-purple-400" strokeWidth={2} />
            <Box className="w-4 h-4 text-pink-400" strokeWidth={2} />
          </motion.div>

          {/* Back to Top */}
          <motion.a
            href="#"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}