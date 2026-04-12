"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Plus,
  Trash2,
  Check,
  X,
  User,
  ArrowRight,
} from "lucide-react";
import { createManifesto, type Snapshot, type TypedIntent } from "@manifesto-ai/sdk";
import { withLineage, createInMemoryLineageStore } from "@manifesto-ai/lineage";
import {
  withGovernance,
  createInMemoryGovernanceStore,
  waitForProposal,
  type GovernanceInstance,
  type Proposal,
} from "@manifesto-ai/governance";
import { todoMel, type TodoDomain, type TodoItem } from "@/lib/domains";

type Mode = "auto_approve" | "hitl";

const AUTO_ACTOR = "actor:auto";
const REVIEW_ACTOR = "actor:review";
const REVIEWER = "actor:reviewer";

function createRuntime(mode: Mode): GovernanceInstance<TodoDomain> {
  const allAutoBindings = [
    {
      actorId: AUTO_ACTOR,
      authorityId: "authority:auto",
      policy: { mode: "auto_approve" as const },
    },
  ];

  const hitlBindings = [
    {
      actorId: AUTO_ACTOR,
      authorityId: "authority:auto",
      policy: { mode: "auto_approve" as const },
    },
    {
      actorId: REVIEW_ACTOR,
      authorityId: "authority:human",
      policy: {
        mode: "hitl" as const,
        delegate: { actorId: REVIEWER, kind: "human" as const, name: "Reviewer" },
      },
    },
  ];

  return withGovernance(
    withLineage(createManifesto<TodoDomain>(todoMel, {}), {
      store: createInMemoryLineageStore(),
    }),
    {
      governanceStore: createInMemoryGovernanceStore(),
      bindings: mode === "auto_approve" ? allAutoBindings : hitlBindings,
      execution: {
        projectionId: "landing-governance-demo",
        deriveActor: (intent: TypedIntent<TodoDomain>) => ({
          actorId:
            mode === "hitl" && intent.type === "removeTodo"
              ? REVIEW_ACTOR
              : AUTO_ACTOR,
          kind: "human" as const,
        }),
        deriveSource: (intent: TypedIntent<TodoDomain>) => ({
          kind: "ui" as const,
          eventId: intent.intentId ?? crypto.randomUUID(),
        }),
      },
    },
  ).activate();
}

const flowSteps = [
  { label: "Actor", icon: User },
  { label: "Intent", icon: ArrowRight },
  { label: "Authority", icon: Shield },
  { label: "Core", icon: ArrowRight },
  { label: "Snapshot", icon: Check },
];

export default function GovernanceSection() {
  const [mode, setMode] = useState<Mode>("auto_approve");
  const runtimeRef = useRef<GovernanceInstance<TodoDomain> | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<TodoDomain["state"]> | null>(null);
  const [proposals, setProposals] = useState<readonly Proposal[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [ready, setReady] = useState(false);
  const [flowActive, setFlowActive] = useState(-1);
  const [flowLabel, setFlowLabel] = useState("");

  useEffect(() => {
    const rt = createRuntime(mode);
    runtimeRef.current = rt;
    setSnapshot(rt.getSnapshot());
    setReady(true);

    const unsub = rt.subscribe(
      (s) => s,
      (s) => setSnapshot(s),
    );

    return () => {
      unsub();
      rt.dispose();
      runtimeRef.current = null;
      setReady(false);
      setProposals([]);
      setFlowActive(-1);
    };
  }, [mode]);

  const animateFlow = useCallback(async (label: string) => {
    setFlowLabel(label);
    for (let i = 0; i < flowSteps.length; i++) {
      setFlowActive(i);
      await new Promise((r) => setTimeout(r, 300));
    }
    await new Promise((r) => setTimeout(r, 400));
    setFlowActive(-1);
    setFlowLabel("");
  }, []);

  const refreshProposals = useCallback(async () => {
    if (!runtimeRef.current) return;
    const all = await runtimeRef.current.getProposals();
    setProposals(all.filter((p) => p.status === "submitted" || p.status === "evaluating"));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!runtimeRef.current || !newTodo.trim()) return;
    const rt = runtimeRef.current;
    const intent = rt.createIntent(rt.MEL.actions.addTodo, newTodo.trim());
    const proposal = await rt.proposeAsync(intent);

    if (proposal.status === "submitted" || proposal.status === "evaluating") {
      await refreshProposals();
      animateFlow(`addTodo("${newTodo.trim()}")`);
    } else {
      await waitForProposal(rt, proposal, { timeoutMs: 500, pollIntervalMs: 50 });
      animateFlow(`addTodo("${newTodo.trim()}")`);
    }
    setNewTodo("");
  }, [newTodo, refreshProposals, animateFlow]);

  const handleRemove = useCallback(
    async (id: string, title: string) => {
      if (!runtimeRef.current) return;
      const rt = runtimeRef.current;
      const intent = rt.createIntent(rt.MEL.actions.removeTodo, id);
      const proposal = await rt.proposeAsync(intent);

      if (proposal.status === "submitted" || proposal.status === "evaluating") {
        await refreshProposals();
        animateFlow(`removeTodo("${title}")`);
      } else {
        await waitForProposal(rt, proposal, { timeoutMs: 500, pollIntervalMs: 50 });
        animateFlow(`removeTodo("${title}")`);
      }
    },
    [refreshProposals, animateFlow],
  );

  const handleToggle = useCallback(
    async (id: string) => {
      if (!runtimeRef.current) return;
      const rt = runtimeRef.current;
      const intent = rt.createIntent(rt.MEL.actions.toggleTodo, id);
      const proposal = await rt.proposeAsync(intent);
      if (proposal.status !== "submitted" && proposal.status !== "evaluating") {
        await waitForProposal(rt, proposal, { timeoutMs: 500, pollIntervalMs: 50 });
      }
      animateFlow("toggleTodo()");
    },
    [animateFlow],
  );

  const handleApprove = useCallback(
    async (proposalId: string) => {
      if (!runtimeRef.current) return;
      const rt = runtimeRef.current;
      const updated = await rt.approve(proposalId);
      await waitForProposal(rt, updated, { timeoutMs: 500, pollIntervalMs: 50 });
      await refreshProposals();
    },
    [refreshProposals],
  );

  const handleReject = useCallback(
    async (proposalId: string) => {
      if (!runtimeRef.current) return;
      await runtimeRef.current.reject(proposalId, "Rejected by demo user");
      await refreshProposals();
    },
    [refreshProposals],
  );

  const todos = (snapshot?.data.todos ?? []) as readonly TodoItem[];

  return (
    <section id="governance" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Governance
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Control who can do what. Toggle between auto-approve and
            human-in-the-loop to see how policy changes the flow.
          </p>
        </motion.div>

        {!ready ? (
          <div className="text-center text-muted p-8">Loading runtime...</div>
        ) : (
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMode("auto_approve")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === "auto_approve"
                    ? "bg-violet-600 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Auto Approve
              </button>
              <button
                onClick={() => setMode("hitl")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === "hitl"
                    ? "bg-amber-600 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                Human-in-the-Loop
              </button>
            </div>

            {mode === "hitl" && (
              <div className="text-center text-xs text-amber-400/80 font-mono">
                removeTodo() requires manual approval
              </div>
            )}

            {/* Flow Animation */}
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {flowSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = flowActive === i;
                const isPast = flowActive > i;
                return (
                  <motion.div
                    key={step.label}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                    }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <div
                      className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1 ${
                        isActive
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                          : "text-muted"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                  </motion.div>
                );
              })}
              {flowLabel && (
                <span className="text-xs text-violet-400 font-mono ml-2">
                  {flowLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Todo List */}
              <div className="gradient-border glow">
                <div className="bg-card rounded-xl p-5">
                  <div className="text-xs font-mono text-muted mb-4 uppercase tracking-wider">
                    Todo App
                  </div>

                  {/* Add Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                      placeholder="Add a todo..."
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-white text-sm placeholder:text-muted focus:border-violet-500 focus:outline-none"
                    />
                    <button
                      onClick={handleAdd}
                      className="px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Todo Items */}
                  <div className="space-y-2 min-h-[120px]">
                    <AnimatePresence>
                      {todos.length === 0 ? (
                        <div className="text-muted text-sm text-center py-6">
                          No todos yet
                        </div>
                      ) : (
                        todos.map((todo) => (
                          <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border"
                          >
                            <button
                              onClick={() => handleToggle(todo.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                todo.completed
                                  ? "bg-violet-600 border-violet-600"
                                  : "border-muted hover:border-violet-500"
                              }`}
                            >
                              {todo.completed && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <span
                              className={`flex-1 text-sm ${
                                todo.completed
                                  ? "text-muted line-through"
                                  : "text-white"
                              }`}
                            >
                              {todo.title}
                            </span>
                            <button
                              onClick={() => handleRemove(todo.id, todo.title)}
                              className="text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs text-muted font-mono">
                    <span>
                      total: {String(snapshot?.computed.totalCount ?? 0)}
                    </span>
                    <span>
                      active: {String(snapshot?.computed.activeCount ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proposal Queue */}
              <div className="gradient-border">
                <div className="bg-card rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">
                      Proposal Queue
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[200px]">
                    <AnimatePresence>
                      {proposals.length === 0 ? (
                        <div className="text-muted text-sm text-center py-8">
                          {mode === "auto_approve"
                            ? "All actions auto-approved"
                            : "No pending proposals — try removing a todo"}
                        </div>
                      ) : (
                        proposals.map((p) => (
                          <motion.div
                            key={p.proposalId}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono text-amber-400">
                                {p.intent.type}
                              </span>
                              <span className="text-[10px] text-muted">
                                {p.proposalId.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(p.proposalId)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20 transition-colors"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(p.proposalId)}
                                className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                              >
                                <ShieldX className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
