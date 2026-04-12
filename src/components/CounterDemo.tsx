"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useManifesto } from "@/lib/use-manifesto";
import { counterMel, type CounterDomain } from "@/lib/domains";
import { diffSnapshots, type DiffEntry } from "@/lib/snapshot-diff";

export default function CounterDemo() {
  const { instance, snapshot, ready } = useManifesto<CounterDomain>(counterMel);
  const [diffs, setDiffs] = useState<DiffEntry[]>([]);
  const [lastAction, setLastAction] = useState<string>("");
  const versionRef = useRef(0);

  const captureAndDispatch = useCallback(
    async (actionName: string, ...args: unknown[]) => {
      if (!instance) return;

      const prevSnap = instance.getSnapshot();
      const prev = {
        data: { ...prevSnap.data },
        computed: { ...prevSnap.computed },
      };

      const action = instance.MEL.actions[actionName as keyof CounterDomain["actions"]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intent = instance.createIntent(action, ...(args as any));
      await instance.dispatchAsync(intent);

      const nextSnap = instance.getSnapshot();
      const next = {
        data: { ...nextSnap.data },
        computed: { ...nextSnap.computed },
      };

      const newDiffs = diffSnapshots(
        prev as unknown as Record<string, unknown>,
        next as unknown as Record<string, unknown>,
      );
      versionRef.current++;
      setDiffs(newDiffs);
      setLastAction(actionName);
    },
    [instance],
  );

  if (!ready || !snapshot) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center text-muted p-8">
        Initializing Manifesto runtime...
      </div>
    );
  }

  const count = snapshot.data.count as number;
  const doubled = snapshot.computed.doubled as number;
  const isPositive = snapshot.computed.isPositive as boolean;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-xs font-mono text-violet-400/60 uppercase tracking-wider">
          Live Demo — Powered by @manifesto-ai/sdk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Counter Controls */}
        <div className="gradient-border glow">
          <div className="bg-card rounded-xl p-6">
            <div className="text-xs font-mono text-muted mb-4 uppercase tracking-wider">
              Interactive Counter
            </div>

            {/* Count Display */}
            <div className="text-center mb-6">
              <motion.div
                key={count}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-white mb-2"
              >
                {count}
              </motion.div>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <span>
                  doubled:{" "}
                  <span className="text-violet-400">{doubled}</span>
                </span>
                <span>
                  positive:{" "}
                  <span className="text-violet-400">{String(isPositive)}</span>
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => captureAndDispatch("decrement")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors"
              >
                <Minus className="w-4 h-4" />
                Decrement
              </button>
              <button
                onClick={() => captureAndDispatch("increment")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Increment
              </button>
              <button
                onClick={() => captureAndDispatch("set", 0)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-white hover:border-violet-500/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Hash badge */}
            <div className="mt-4 text-center">
              <span className="text-xs font-mono text-muted">
                schema: {snapshot.meta.schemaHash.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Right: Snapshot Diff */}
        <div className="gradient-border">
          <div className="bg-card rounded-xl p-6">
            <div className="text-xs font-mono text-muted mb-4 uppercase tracking-wider">
              Snapshot Diff
              {lastAction && (
                <span className="text-violet-400 ml-2">
                  after {lastAction}()
                </span>
              )}
            </div>

            <div className="font-mono text-sm space-y-1 min-h-[200px]">
              <AnimatePresence mode="wait">
                {diffs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted text-center py-8"
                  >
                    Click a button to see the diff
                  </motion.div>
                ) : (
                  <motion.div
                    key={lastAction + versionRef.current}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {diffs.map((diff) => (
                      <DiffLine key={diff.path} entry={diff} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiffLine({ entry }: { entry: DiffEntry }) {
  const colorClass =
    entry.type === "added"
      ? "text-green-400"
      : entry.type === "removed"
        ? "text-red-400"
        : "text-amber-400";

  const prefix =
    entry.type === "added" ? "+" : entry.type === "removed" ? "-" : "~";

  return (
    <div
      className={`flex items-start gap-2 px-3 py-1.5 rounded-md ${
        entry.type === "added"
          ? "bg-green-500/5"
          : entry.type === "removed"
            ? "bg-red-500/5"
            : "bg-amber-500/5"
      }`}
    >
      <span className={`${colorClass} font-bold w-3 shrink-0`}>{prefix}</span>
      <span className="text-muted-foreground">{entry.path}:</span>
      {entry.type === "changed" && (
        <>
          <span className="text-red-400/70 line-through">
            {JSON.stringify(entry.prev)}
          </span>
          <span className="text-muted">→</span>
        </>
      )}
      <span className={colorClass}>
        {JSON.stringify(entry.type === "removed" ? entry.prev : entry.next)}
      </span>
    </div>
  );
}
