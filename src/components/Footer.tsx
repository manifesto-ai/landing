"use client";

import { motion } from "framer-motion";
import { Github, Twitter, MessageCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const links = {
  resources: [
    { label: "Documentation", href: "https://github.com/manifesto-ai/core.git#documentation" },
    { label: "Getting Started", href: "https://github.com/manifesto-ai/core.git#quick-start" },
    { label: "Examples", href: "https://github.com/manifesto-ai/core.git#live-examples" },
    { label: "Playground", href: "https://playground.manifesto-ai.dev" },
  ],
  community: [
    { label: "GitHub", href: "https://github.com/manifesto-ai/core.git", icon: Github },
    { label: "Twitter", href: "https://x.com/manifesto__ai", icon: Twitter },
    { label: "Discord", href: "#", icon: MessageCircle },
  ],
  // demos: [
  //   { label: "React Storybook", href: "https://eggplantiny.github.io/manifesto-ai/react/" },
  //   { label: "Vue Storybook", href: "https://eggplantiny.github.io/manifesto-ai/vue/" },
  // ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

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
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 blur-sm opacity-75" />
                <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white">Manifesto AI</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              AI-Native Semantic UI State Layer. Turn any form into a
              machine-readable interface for LLM agents.
            </p>
            <div className="flex items-center gap-4">
              {links.community.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Live Demos */}
          {/*<motion.div*/}
          {/*  initial={{ opacity: 0, y: 20 }}*/}
          {/*  whileInView={{ opacity: 1, y: 0 }}*/}
          {/*  viewport={{ once: true }}*/}
          {/*  transition={{ duration: 0.5, delay: 0.2 }}*/}
          {/*>*/}
          {/*  <h4 className="text-sm font-semibold text-white mb-4">Live Demos</h4>*/}
          {/*  <ul className="space-y-3">*/}
          {/*    {links.demos.map((link) => (*/}
          {/*      <li key={link.label}>*/}
          {/*        <Link*/}
          {/*          href={link.href}*/}
          {/*          target="_blank"*/}
          {/*          rel="noopener noreferrer"*/}
          {/*          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"*/}
          {/*        >*/}
          {/*          {link.label}*/}
          {/*          <ExternalLink className="w-3 h-3" />*/}
          {/*        </Link>*/}
          {/*      </li>*/}
          {/*    ))}*/}
          {/*  </ul>*/}
          {/*</motion.div>*/}

          {/* Newsletter / CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-white mb-4">
              Get Started
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Ready to make your UI AI-ready?
            </p>
            <div className="space-y-3">
              <code className="block text-xs bg-slate-800/50 rounded-lg px-3 py-2 text-emerald-400 font-mono">
                pnpm add @manifesto-ai/schema @manifesto-ai/engine
              </code>
              <Link
                href="https://github.com/manifesto-ai/core.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 transition-all"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {new Date().getFullYear()} Manifesto AI. Open Source under MIT
              License.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/manifesto-ai/core.git/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
              >
                License
              </Link>
              <Link
                href="https://github.com/manifesto-ai/core.git/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
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
