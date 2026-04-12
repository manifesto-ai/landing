"use client";

import { motion } from "framer-motion";
import { ExternalLink, Bot, Shield, GitBranch, Eye, Github } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Agent Integration",
    description:
      "AI agents propose state changes through the same governance protocol as human users.",
  },
  {
    icon: Shield,
    title: "Governed AI Actions",
    description:
      "Every AI decision goes through authority evaluation — approve, reject, or constrain.",
  },
  {
    icon: GitBranch,
    title: "Full Traceability",
    description:
      "Trace every state change back to the AI agent, the intent, and the authority that approved it.",
  },
  {
    icon: Eye,
    title: "Predictable Outcomes",
    description:
      "Simulate AI actions before execution. Know exactly what will change.",
  },
];

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Real-World Showcase
          </h2>
          <p className="text-sm text-violet-400 font-medium mb-2">
            Not just demos — a production app with AI agents under governance.
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            TaskFlow is a task management app powered by Manifesto + AI Agent.
            Every AI action is governed, traceable, and simulatable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Preview Screenshot */}
          <a
            href="https://taskflow.manifesto-ai.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="block gradient-border glow group"
          >
            <div className="bg-card rounded-xl p-2 sm:p-3 overflow-hidden">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src="/taskflow-preview.png"
                  alt="TaskFlow — AI-powered task management with Manifesto governance"
                  className="w-full rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600/90 text-white text-sm font-medium backdrop-blur-sm">
                    Try TaskFlow Live
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pt-3 pb-1">
                <span className="text-xs font-mono text-muted">
                  taskflow.manifesto-ai.dev
                </span>
                <span className="text-xs text-violet-400 font-mono">
                  Powered by GPT-5.4-nano + Manifesto SDK
                </span>
              </div>
            </div>
          </a>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="gradient-border"
                >
                  <div className="bg-card rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-500/10 shrink-0">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://taskflow.manifesto-ai.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 transition-all hover:scale-105"
            >
              Try TaskFlow Live
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/manifesto-ai/taskflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-white border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
