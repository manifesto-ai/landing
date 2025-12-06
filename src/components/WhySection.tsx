"use client";

import { motion } from "framer-motion";
import { AlertCircle, Binary, Network, Puzzle, Scan, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function WhySection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />

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
            Why <span className="gradient-text">Manifesto</span>?
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            Most form libraries generate UI from schemas.{" "}
            <span className="text-white font-medium">
              Manifesto does that too—but that&apos;s not what makes it special.
            </span>
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {/* Traditional UI Card */}
          <motion.div
            variants={itemVariants}
            className="relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 opacity-70"
          >
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                Traditional
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-400">
                Traditional UI
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Scan className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">
                    AI sees DOM/pixels
                  </p>
                  <p className="text-sm text-slate-500">
                    Raw HTML structure without meaning
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">
                    &quot;There&apos;s an input field&quot;
                  </p>
                  <p className="text-sm text-slate-500">
                    No understanding of purpose or rules
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Binary className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 font-medium">
                    AI guesses what to do
                  </p>
                  <p className="text-sm text-slate-500">
                    Trial and error, high failure rate
                  </p>
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className="mt-8 p-4 rounded-lg bg-slate-950/50 border border-slate-800">
              <code className="text-xs text-slate-500 font-mono">
                {`<input class="xyz123" type="text" />`}
                <br />
                {`<button>???</button>`}
              </code>
            </div>
          </motion.div>

          {/* Manifesto Card */}
          <motion.div
            variants={itemVariants}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-emerald-500/30 glow"
          >
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                Manifesto
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                <Network className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                With Manifesto
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">AI gets semantic state</p>
                  <p className="text-sm text-slate-400">
                    Complete context and meaning
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    &quot;This is &apos;email&apos;, required, currently invalid&quot;
                  </p>
                  <p className="text-sm text-slate-400">
                    Full field context and dependencies
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    AI knows exactly what&apos;s valid
                  </p>
                  <p className="text-sm text-slate-400">
                    Predictable, reliable automation
                  </p>
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className="mt-8 p-4 rounded-lg bg-slate-950/50 border border-emerald-500/20">
              <code className="text-xs text-emerald-300 font-mono">
                {`{ field: "email", required: true,`}
                <br />
                {`  valid: false, type: "string" }`}
              </code>
            </div>
          </motion.div>
        </motion.div>

        {/* Key Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <span className="text-lg font-medium text-white">
              Manifesto exports the{" "}
              <span className="gradient-text">complete semantic context</span>—
            </span>
          </div>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Values, rules, dependencies, validation state, available
            transitions—in a structure AI can reason about.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
