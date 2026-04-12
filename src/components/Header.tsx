"use client";

import { motion } from "framer-motion";
import { Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Manifesto" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-white">Manifesto</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#flow-xray"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Flow
            </Link>
            <Link
              href="#simulation"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Simulation
            </Link>
            <Link
              href="#governance"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Governance
            </Link>
            <Link
              href="#architecture"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Architecture
            </Link>
            <Link
              href="https://docs.manifesto-ai.dev"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/manifesto-ai/core"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <Link
              href="https://docs.manifesto-ai.dev/guide/quick-start"
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="#flow-xray"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flow
              </Link>
              <Link
                href="#simulation"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Simulation
              </Link>
              <Link
                href="#governance"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Governance
              </Link>
              <Link
                href="#architecture"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Architecture
              </Link>
              <Link
                href="https://docs.manifesto-ai.dev"
                className="text-sm text-muted-foreground hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link
                href="https://github.com/manifesto-ai/core"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Link>
              <Link
                href="https://docs.manifesto-ai.dev/guide/quick-start"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
