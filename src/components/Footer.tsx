"use client";

import { motion } from "framer-motion";
import { Github, Twitter, ExternalLink } from "lucide-react";
import Link from "next/link";

const links = {
  resources: [
    { label: "Documentation", href: "https://doc.manifesto-ai.dev" },
    { label: "Quick Start", href: "https://doc.manifesto-ai.dev/guide/quick-start" },
    { label: "API Reference", href: "https://doc.manifesto-ai.dev/api/" },
  ],
  community: [
    { label: "GitHub", href: "https://github.com/manifesto-ai/core", icon: Github },
    { label: "Twitter", href: "https://x.com/manifesto__ai", icon: Twitter },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 blur-sm opacity-75" />
                <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white">Manifesto</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Semantic Layer for Deterministic Domain State. Define once, compute
              everywhere.
            </p>
            <div className="flex items-center gap-4">
              {links.community.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">Packages</h4>
            <ul className="space-y-2 text-xs font-mono text-muted-foreground">
              <li>@manifesto-ai/sdk</li>
              <li>@manifesto-ai/core</li>
              <li>@manifesto-ai/governance</li>
              <li>@manifesto-ai/lineage</li>
              <li>@manifesto-ai/compiler</li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">
              Get Started
            </h4>
            <div className="space-y-3">
              <code className="block text-xs bg-violet-500/5 border border-violet-500/10 rounded-lg px-3 py-2 text-violet-400 font-mono">
                pnpm add @manifesto-ai/sdk
              </code>
              <Link
                href="https://github.com/manifesto-ai/core"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 transition-all"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {new Date().getFullYear()} Manifesto. Open Source under MIT
              License.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/manifesto-ai/core/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-muted-foreground transition-colors"
              >
                License
              </Link>
              <Link
                href="https://github.com/manifesto-ai/core/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-muted-foreground transition-colors"
              >
                Contributing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
