"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 mb-8"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">
              Open Source & AI-Native
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="gradient-text">AI-Native</span>
            <br />
            <span className="text-white">Semantic UI State Layer</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-8"
          >
            The only UI framework where AI agents can truly{" "}
            <span className="text-white font-medium">understand</span>,{" "}
            <span className="text-white font-medium">reason about</span>, and{" "}
            <span className="text-white font-medium">interact</span> with your
            interface—not just see pixels.
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base text-emerald-400 font-mono mb-10"
          >
            Turn any form into a machine-readable interface for LLM agents.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="https://playground.manifesto-ai.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 rounded-xl font-medium text-white overflow-hidden transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Try the Playground
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="https://github.com/manifesto-ai/core/tree/main/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl font-medium text-white border border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 transition-all"
            >
              Read the Docs
            </Link>
          </motion.div>
        </div>

        {/* Demo Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="gradient-border glow">
            {/* Window Chrome */}
            <div className="bg-slate-900 rounded-t-xl border-b border-slate-700 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-500 font-mono">
                  https://playground.manifesto-ai.dev
                </span>
              </div>
            </div>

            {/* Demo Content Placeholder */}
            <div className="bg-slate-900/50 rounded-b-xl p-8 min-h-[300px] flex flex-col items-center justify-center">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                AI understands your form&apos;s semantic context and can fill fields
                intelligently
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Interactive demo coming soon</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
