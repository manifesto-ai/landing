"use client";

import { motion } from "framer-motion";
import {
  Box,
  Cpu,
  Database,
  Layout,
  Sparkles,
  ArrowDown,
} from "lucide-react";

export default function Architecture() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            <span className="gradient-text">Architecture</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            A clean separation of concerns: define data, design UI, connect to AI
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Top Layer - Schema Definition */}
          <div className="relative">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Schema Definition
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <Database className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Entity Schema</p>
                  <p className="text-xs text-slate-500 mt-1">Data Model</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <Layout className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">View Schema</p>
                  <p className="text-xs text-slate-500 mt-1">UI Layout</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <Box className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Action Schema</p>
                  <p className="text-xs text-slate-500 mt-1">Workflows</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-4">
              <div className="p-2 rounded-full bg-slate-800 border border-slate-700">
                <ArrowDown className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Middle Layer - Engine */}
          <div className="relative">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  @manifesto-ai/engine
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Evaluator", desc: "Expressions" },
                  { name: "Tracker", desc: "Dependencies" },
                  { name: "Runtime", desc: "State" },
                  { name: "Loader", desc: "Schema" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center"
                  >
                    <Cpu className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-4">
              <div className="flex items-center gap-8">
                <div className="hidden md:block w-24 h-px bg-gradient-to-r from-transparent to-slate-700" />
                <div className="p-2 rounded-full bg-slate-800 border border-slate-700">
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="hidden md:block w-24 h-px bg-gradient-to-l from-transparent to-slate-700" />
              </div>
            </div>
          </div>

          {/* Bottom Layer - Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* React */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                    <path d="M12 21.35c-1.5 0-4.5-.5-7-2.5s-3.5-4.5-3.5-6.85 1.5-4.85 3.5-6.85 5.5-2.5 7-2.5 4.5.5 7 2.5 3.5 4.5 3.5 6.85-1.5 4.85-3.5 6.85-5.5 2.5-7 2.5Zm0-17.7c-1.21 0-3.87.45-6 2.25S2.85 9.73 2.85 12 3.93 16.13 6 17.9s4.79 2.25 6 2.25 3.87-.45 6-2.25 3.15-3.83 3.15-6.1-1.08-4.37-3.15-6.15S13.21 3.65 12 3.65Z" />
                  </svg>
                </div>
                <p className="text-sm font-mono text-slate-400 mb-2">
                  @manifesto-ai/react
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-white">useFormRuntime</p>
                  <p className="text-xs text-white">FormRenderer</p>
                </div>
              </div>
            </motion.div>

            {/* Vue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2 3h3.5L12 15l6.5-12H22L12 21 2 3zm4.5 0h3L12 8l2.5-5h3L12 13 6.5 3z" />
                  </svg>
                </div>
                <p className="text-sm font-mono text-slate-400 mb-2">
                  @manifesto-ai/vue
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-white">useFormRuntime</p>
                  <p className="text-xs text-white">FormRenderer</p>
                </div>
              </div>
            </motion.div>

            {/* AI Util */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-sm font-mono text-slate-400 mb-2">
                  @manifesto-ai/ai-util
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-white">Semantic Snapshot</p>
                  <p className="text-xs text-white">Tool Definitions</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Packages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Packages
          </h3>
          <div className="space-y-2">
            {[
              {
                name: "@manifesto-ai/schema",
                desc: "Schema types, builders, validators",
              },
              { name: "@manifesto-ai/engine", desc: "Core runtime engine" },
              {
                name: "@manifesto-ai/ai-util",
                desc: "AI interoperability utilities",
              },
              { name: "@manifesto-ai/react", desc: "React bindings" },
              { name: "@manifesto-ai/vue", desc: "Vue bindings" },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800"
              >
                <code className="text-sm text-emerald-400">{pkg.name}</code>
                <span className="text-sm text-slate-500">{pkg.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
