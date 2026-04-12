"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Server,
  Package,
  Shield,
  GitBranch,
  ChevronRight,
  X,
} from "lucide-react";

type NodeId = "core" | "host" | "sdk" | "governance" | "lineage";

interface ArchNode {
  id: NodeId;
  name: string;
  pkg: string;
  icon: typeof Cpu;
  color: string;
  description: string;
  responsibilities: string[];
  apis: string[];
}

const nodes: ArchNode[] = [
  {
    id: "core",
    name: "Core",
    pkg: "@manifesto-ai/core",
    icon: Cpu,
    color: "from-violet-500 to-purple-600",
    description: "Pure semantic computation engine. Same input always produces same output.",
    responsibilities: [
      "Expression evaluation",
      "Flow interpretation",
      "Patch generation",
      "Schema validation",
    ],
    apis: ["compute()", "apply()", "validate()", "explain()"],
  },
  {
    id: "host",
    name: "Host",
    pkg: "@manifesto-ai/host",
    icon: Server,
    color: "from-blue-500 to-indigo-600",
    description: "Effect execution runtime. Runs the compute loop and fulfills requirements.",
    responsibilities: [
      "Effect execution",
      "Compute loop orchestration",
      "Patch application",
      "Requirement fulfillment",
    ],
    apis: ["Mailbox", "Runner", "Job model"],
  },
  {
    id: "sdk",
    name: "SDK",
    pkg: "@manifesto-ai/sdk",
    icon: Package,
    color: "from-violet-600 to-fuchsia-500",
    description:
      "Public API surface. Activation-first composition of Core + Host.",
    responsibilities: [
      "createManifesto()",
      "Type-safe MEL refs",
      "Subscribe & Events",
      "Simulation",
    ],
    apis: [
      "createManifesto()",
      "dispatchAsync()",
      "simulate()",
      "subscribe()",
      "on()",
    ],
  },
  {
    id: "governance",
    name: "Governance",
    pkg: "@manifesto-ai/governance",
    icon: Shield,
    color: "from-amber-500 to-orange-600",
    description: "Policy enforcement layer. Controls who can do what.",
    responsibilities: [
      "Proposal lifecycle",
      "Authority evaluation",
      "Auto-approve / HITL modes",
      "Decision recording",
    ],
    apis: [
      "withGovernance()",
      "proposeAsync()",
      "approve()",
      "reject()",
    ],
  },
  {
    id: "lineage",
    name: "Lineage",
    pkg: "@manifesto-ai/lineage",
    icon: GitBranch,
    color: "from-teal-500 to-cyan-600",
    description: "World tracking and branching. Every state change is recorded.",
    responsibilities: [
      "World DAG maintenance",
      "Branch management",
      "Commit history",
      "State restoration",
    ],
    apis: [
      "withLineage()",
      "commitAsync()",
      "getLineage()",
      "createBranch()",
    ],
  },
];

const edges: { from: NodeId; to: NodeId; label: string }[] = [
  { from: "sdk", to: "core", label: "computes" },
  { from: "sdk", to: "host", label: "executes" },
  { from: "governance", to: "sdk", label: "composes" },
  { from: "lineage", to: "sdk", label: "composes" },
  { from: "governance", to: "lineage", label: "requires" },
];

export default function ArchitectureSection() {
  const [selected, setSelected] = useState<NodeId | null>(null);
  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Architecture
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Five composable packages. Each with a single responsibility.
            Click a node to explore.
          </p>
        </motion.div>

        {/* Node Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {nodes.map((node, i) => {
            const Icon = node.icon;
            const isSelected = selected === node.id;
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className={`relative p-5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-violet-500/50 bg-violet-500/10 scale-105"
                    : "border-border bg-card hover:border-violet-500/30 hover:bg-card/80"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-white text-sm mb-1">
                  {node.name}
                </div>
                <div className="text-xs text-muted font-mono truncate">
                  {node.pkg}
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="arch-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-violet-500 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Connection lines (simplified text) */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {edges.map((edge) => (
            <div
              key={`${edge.from}-${edge.to}`}
              className="text-xs font-mono text-muted-foreground flex items-center gap-1 px-3 py-1 rounded-full border border-border bg-card/50"
            >
              <span className="text-violet-400">{edge.from}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-purple-400">{edge.to}</span>
              <span className="text-muted">({edge.label})</span>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-6 border border-violet-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedNode.name}
                    </h3>
                    <p className="text-sm font-mono text-violet-400">
                      {selectedNode.pkg}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg hover:bg-violet-500/10 text-muted hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-muted-foreground mb-6">
                  {selectedNode.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                      Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {selectedNode.responsibilities.map((r) => (
                        <li
                          key={r}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                      Key APIs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.apis.map((api) => (
                        <span
                          key={api}
                          className="text-xs font-mono px-2 py-1 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20"
                        >
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Composition chain */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-4 rounded-xl bg-card border border-border">
            <div className="text-xs font-mono text-muted mb-2 uppercase tracking-wider">
              Composition Pattern
            </div>
            <code className="text-sm text-violet-300">
              withGovernance(withLineage(createManifesto(schema,
              effects))).activate()
            </code>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
