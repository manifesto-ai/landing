"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileJson,
  Plug,
  Zap,
  Shield,
  FileCode2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Semantic State Export",
    description:
      "AI agents get full context, not just rendered output. Export values, rules, dependencies, and validation state.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: FileJson,
    title: "Schema-First",
    description:
      "Define forms as data. Perfect for AI to generate and modify. Single source of truth for all your UI rules.",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    icon: Plug,
    title: "Framework Agnostic",
    description:
      "React, Vue, or bring your own. Same schema works across all frameworks with consistent behavior.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Zap,
    title: "Reactive Engine",
    description:
      "Automatic dependency tracking and conditional updates. Changes propagate instantly through the field graph.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Secure DSL",
    description:
      "Expression language with whitelisted operators, no eval(). Safe to run AI-generated schemas.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: FileCode2,
    title: "Type-Safe",
    description:
      "Full TypeScript support. Catch errors at compile time with fully typed schemas and expressions.",
    gradient: "from-violet-500 to-purple-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
      </div>

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
            Key <span className="gradient-text">Features</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            Everything you need to build AI-ready forms and interfaces
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 ${
                index === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />

              <div className="relative">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}
                >
                  <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Use Cases
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Auto-fill forms",
                description:
                  "AI reads field semantics, fills with contextually appropriate values",
              },
              {
                title: "Form validation assistance",
                description:
                  "AI understands constraints, suggests fixes for invalid inputs",
              },
              {
                title: "Guided workflows",
                description:
                  "AI knows current step, available transitions, required fields",
              },
              {
                title: "Accessibility agents",
                description:
                  "AI navigates forms semantically, not by pixel coordinates",
              },
              {
                title: "Testing automation",
                description: "Generate test cases from semantic structure",
              },
              {
                title: "Schema generation",
                description: "AI creates new form schemas from natural language",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-800"
              >
                <h4 className="text-white font-medium mb-1">{useCase.title}</h4>
                <p className="text-sm text-slate-400">{useCase.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
