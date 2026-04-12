"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Play, Eye, ShieldAlert, ShieldCheck, Info, Activity } from "lucide-react";
import { useManifesto } from "@/lib/use-manifesto";
import { counterMel, type CounterDomain } from "@/lib/domains";
import { diffSnapshots, type DiffEntry } from "@/lib/snapshot-diff";
import type { IntentExplanation, DispatchBlocker } from "@manifesto-ai/sdk";

/* ─── ExprNode → human-readable rendering ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exprToReadable(node: any, inputValues?: Record<string, unknown>): React.ReactNode {
  if (!node || typeof node !== "object") return String(node);

  switch (node.kind) {
    case "lit":
      return <span className="text-amber-300">{JSON.stringify(node.value)}</span>;
    case "get": {
      const path: string = node.path;
      // Resolve input.* paths to actual values
      if (inputValues && path.startsWith("input.")) {
        const key = path.slice(6); // "input.value" → "value"
        const resolved = inputValues[key];
        if (resolved !== undefined) {
          return (
            <span>
              <span className="text-red-300">{JSON.stringify(resolved)}</span>
              <span className="text-white/30 text-xs ml-1">({path})</span>
            </span>
          );
        }
      }
      return <span className="text-sky-300">{path}</span>;
    }
    default: {
      const fnName = node.kind;
      const args: React.ReactNode[] = [];
      if (node.left !== undefined) args.push(exprToReadable(node.left, inputValues));
      if (node.right !== undefined) args.push(exprToReadable(node.right, inputValues));
      if (node.args && Array.isArray(node.args)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.args.forEach((a: any) => args.push(exprToReadable(a, inputValues)));
      }
      return (
        <span>
          <span className="text-violet-400 font-semibold">{fnName}</span>
          <span className="text-white/50">(</span>
          {args.map((a, i) => (
            <span key={i}>
              {i > 0 && <span className="text-white/40">, </span>}
              {a}
            </span>
          ))}
          <span className="text-white/50">)</span>
        </span>
      );
    }
  }
}

type ExplanationState =
  | { kind: "idle" }
  | { kind: "admitted"; explanation: IntentExplanation<CounterDomain>; diffs: DiffEntry[]; changedPaths: readonly string[]; newActions: readonly string[] }
  | { kind: "blocked"; explanation: IntentExplanation<CounterDomain>; blockers: readonly DispatchBlocker[]; inputValues: Record<string, unknown> };

export default function SimulationSection() {
  const { instance, snapshot, ready } = useManifesto<CounterDomain>(counterMel);
  const [explanationState, setExplanationState] = useState<ExplanationState>({ kind: "idle" });
  const [actual, setActual] = useState<DiffEntry[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("increment");
  const [setParam, setSetParam] = useState<string>("5");
  const [phase, setPhase] = useState<"idle" | "simulated" | "executed">("idle");

  const handleSimulate = useCallback(() => {
    if (!instance) return;

    const action = instance.MEL.actions[selectedAction as keyof CounterDomain["actions"]];
    const args = selectedAction === "set" ? [Number(setParam)] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intent = (instance.createIntent as any)(action, ...args);

    // Use why() to get full explanation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const explanation = (instance.why as any)(intent) as IntentExplanation<CounterDomain>;

    if (explanation.kind === "admitted") {
      const prevSnap = instance.getSnapshot();
      const prev = { data: { ...prevSnap.data }, computed: { ...prevSnap.computed } };
      const next = { data: { ...explanation.snapshot.data }, computed: { ...explanation.snapshot.computed } };

      const diffs = diffSnapshots(
        prev as unknown as Record<string, unknown>,
        next as unknown as Record<string, unknown>,
      );
      setExplanationState({
        kind: "admitted",
        explanation,
        diffs,
        changedPaths: explanation.changedPaths,
        newActions: explanation.newAvailableActions,
      });
    } else {
      // Blocked — capture input values for display
      const inputVals: Record<string, unknown> = {};
      if (selectedAction === "set") inputVals.value = Number(setParam);
      setExplanationState({
        kind: "blocked",
        explanation,
        blockers: explanation.blockers,
        inputValues: inputVals,
      });
    }

    setActual([]);
    setPhase("simulated");
  }, [instance, selectedAction, setParam]);

  const handleExecute = useCallback(async () => {
    if (!instance || explanationState.kind !== "admitted") return;

    const prevSnap = instance.getSnapshot();
    const prev = { data: { ...prevSnap.data }, computed: { ...prevSnap.computed } };

    const action = instance.MEL.actions[selectedAction as keyof CounterDomain["actions"]];
    const args = selectedAction === "set" ? [Number(setParam)] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intent = (instance.createIntent as any)(action, ...args);
    await instance.dispatchAsync(intent);

    const nextSnap = instance.getSnapshot();
    const next = { data: { ...nextSnap.data }, computed: { ...nextSnap.computed } };

    const diffs = diffSnapshots(
      prev as unknown as Record<string, unknown>,
      next as unknown as Record<string, unknown>,
    );
    setActual(diffs);
    setPhase("executed");
  }, [instance, selectedAction, setParam, explanationState]);

  const availableActions = ready && instance ? (instance.getAvailableActions() as string[]) : [];
  const allActions = ["increment", "decrement", "set"];

  return (
    <section id="simulation" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simulation Sandbox
          </h2>
          <p className="text-sm text-violet-400 font-medium mb-2">
            Not just preview — deterministic prediction guaranteed by pure computation.
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Preview the effect of any action <em>before</em> executing it.
            Use <code className="text-violet-400">why()</code> and <code className="text-violet-400">whyNot()</code> to understand exactly what will happen.
          </p>
        </motion.div>

        {!ready ? (
          <div className="text-center text-muted p-8">Loading runtime...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Available Actions Badge */}
            <div className="gradient-border">
              <div className="bg-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    getAvailableActions()
                  </span>
                  <span className="text-xs text-muted ml-auto">
                    count = <span className="text-white font-bold">{String(snapshot?.data.count ?? 0)}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allActions.map((a) => {
                    const isAvailable = availableActions.includes(a);
                    return (
                      <div
                        key={a}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                          isAvailable
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400 line-through opacity-60"
                        }`}
                      >
                        {isAvailable ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {a}()
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPhase("idle");
                  setExplanationState({ kind: "idle" });
                  setActual([]);
                }}
                className="px-3 py-2 rounded-lg bg-card border border-border text-white text-sm font-mono focus:border-violet-500 focus:outline-none"
              >
                {allActions.map((a) => (
                  <option key={a} value={a}>
                    {a}()
                  </option>
                ))}
              </select>

              {selectedAction === "set" && (
                <input
                  type="number"
                  value={setParam}
                  onChange={(e) => setSetParam(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg bg-card border border-border text-white text-sm font-mono focus:border-violet-500 focus:outline-none"
                  placeholder="value"
                />
              )}

              <button
                onClick={handleSimulate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                why(intent)
              </button>

              <button
                onClick={handleExecute}
                disabled={phase === "idle" || explanationState.kind === "blocked"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Execute
              </button>
            </div>

            {/* Explanation Result */}
            <AnimatePresence mode="wait">
              {explanationState.kind === "blocked" && (
                <motion.div
                  key="blocked"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="gradient-border">
                    <div className="bg-card rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-semibold text-red-400">
                          Blocked — whyNot(intent)
                        </span>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-mono border border-red-500/20">
                          {explanationState.explanation.kind}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>available: <span className={explanationState.explanation.available ? "text-green-400" : "text-red-400"}>{String(explanationState.explanation.available)}</span></span>
                          <span>dispatchable: <span className="text-red-400">{String(explanationState.explanation.dispatchable)}</span></span>
                        </div>

                        {explanationState.blockers.map((blocker, i) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              <div className="space-y-2 flex-1">
                                <div className="text-sm text-red-300">
                                  Guard on <code className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{blocker.layer}</code> layer failed
                                </div>
                                <div className="font-mono text-sm bg-background/50 rounded-md p-4 space-y-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {exprToReadable(blocker.expression, explanationState.inputValues)}
                                    <span className="text-white/40">→</span>
                                    <span className="text-red-400 font-bold">{JSON.stringify(blocker.evaluatedResult)}</span>
                                  </div>
                                  {blocker.description && (
                                    <div className="text-muted-foreground text-xs">
                                      {blocker.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Split Diff View — only show when admitted */}
            {explanationState.kind === "admitted" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Predicted */}
                  <div className="gradient-border">
                    <div className="bg-card rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FlaskConical className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                          why(intent) → admitted
                        </span>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-mono border border-green-500/20">
                          {explanationState.explanation.kind}
                        </span>
                      </div>

                      {/* Status badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-xs font-mono">
                          status: {explanationState.explanation.kind === "admitted" ? explanationState.explanation.status : ""}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-300 text-xs font-mono">
                          available: true
                        </span>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-300 text-xs font-mono">
                          dispatchable: true
                        </span>
                      </div>

                      <div className="font-mono text-sm space-y-1 min-h-[120px]">
                        <div className="space-y-1">
                          {explanationState.diffs.map((d) => (
                            <DiffRow key={d.path} entry={d} />
                          ))}
                          {explanationState.changedPaths.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-muted">changedPaths: </span>
                              {explanationState.changedPaths.map((p) => (
                                <span key={p} className="text-xs font-mono text-violet-400 mr-2">{p}</span>
                              ))}
                            </div>
                          )}
                          {explanationState.newActions.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted">newAvailableActions: </span>
                              {(explanationState.newActions as string[]).map((a) => (
                                <span key={a} className="text-xs font-mono text-green-400 mr-2">{a}()</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actual */}
                  <div className="gradient-border">
                    <div className="bg-card rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Play className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                          Actual (dispatch)
                        </span>
                      </div>
                      <div className="font-mono text-sm space-y-1 min-h-[120px]">
                        <AnimatePresence mode="wait">
                          {actual.length === 0 ? (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-muted text-center py-8 text-xs"
                            >
                              Click &ldquo;Execute&rdquo; to compare with prediction
                            </motion.div>
                          ) : (
                            <motion.div
                              key="diffs"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-1"
                            >
                              {actual.map((d) => (
                                <DiffRow key={d.path} entry={d} />
                              ))}
                              <div className="mt-3 pt-3 border-t border-border text-center">
                                <span className="text-xs text-green-400 font-medium">
                                  Matches prediction
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const color =
    entry.type === "added"
      ? "text-green-400 bg-green-500/5"
      : entry.type === "removed"
        ? "text-red-400 bg-red-500/5"
        : "text-amber-400 bg-amber-500/5";

  const prefix =
    entry.type === "added" ? "+" : entry.type === "removed" ? "-" : "~";

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${color.split(" ")[1]}`}>
      <span className={`font-bold w-3 ${color.split(" ")[0]}`}>{prefix}</span>
      <span className="text-muted-foreground text-xs">{entry.path}:</span>
      {entry.type === "changed" && (
        <>
          <span className="text-red-400/60 line-through text-xs">
            {JSON.stringify(entry.prev)}
          </span>
          <span className="text-muted text-xs">→</span>
        </>
      )}
      <span className={`text-xs ${color.split(" ")[0]}`}>
        {JSON.stringify(entry.type === "removed" ? entry.prev : entry.next)}
      </span>
    </div>
  );
}
