"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, RotateCcw, Zap } from "lucide-react";
import { createManifesto, type Snapshot } from "@manifesto-ai/sdk";
import { withLineage, createInMemoryLineageStore } from "@manifesto-ai/lineage";
import { counterMel, type CounterDomain } from "@/lib/domains";

type WorldNode = {
  worldId: string;
  action: string;
  count: number;
  index: number;
};

function createLineageRuntime() {
  return withLineage(createManifesto<CounterDomain>(counterMel, {}), {
    store: createInMemoryLineageStore(),
  }).activate();
}

export default function LineageSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeRef = useRef<ReturnType<typeof createLineageRuntime> | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<CounterDomain["state"]> | null>(null);
  const [timeline, setTimeline] = useState<WorldNode[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ready, setReady] = useState(false);
  const indexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rt = createLineageRuntime();
    runtimeRef.current = rt;
    setSnapshot(rt.getSnapshot());
    setReady(true);

    const snap = rt.getSnapshot();
    const initNode: WorldNode = {
      worldId: "init",
      action: "init",
      count: (snap.data.count as number) ?? 0,
      index: 0,
    };
    setTimeline([initNode]);
    setActiveIndex(0);
    indexRef.current = 0;

    const unsub = rt.subscribe(
      (s) => s,
      (s) => setSnapshot(s),
    );

    return () => {
      unsub();
      rt.dispose();
      runtimeRef.current = null;
      setReady(false);
      setTimeline([]);
      setActiveIndex(-1);
    };
  }, []);

  const dispatchAction = useCallback(
    async (actionName: "increment" | "decrement") => {
      if (!runtimeRef.current) return;
      const rt = runtimeRef.current;
      const action = rt.MEL.actions[actionName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intent = (rt.createIntent as any)(action);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (rt as any).commitAsync(intent);

      const snap = rt.getSnapshot();
      const newIndex = ++indexRef.current;
      const node: WorldNode = {
        worldId: crypto.randomUUID().slice(0, 8),
        action: actionName,
        count: snap.data.count as number,
        index: newIndex,
      };

      setTimeline((prev) => {
        const trimmed = prev.slice(0, activeIndex + 1);
        return [...trimmed, node];
      });
      setActiveIndex(newIndex);

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      });
    },
    [activeIndex],
  );

  const handleRestore = useCallback(
    async (index: number) => {
      if (!runtimeRef.current || index === activeIndex) return;
      const rt = runtimeRef.current;

      const targetNode = timeline[index];
      if (!targetNode) return;

      // Rebuild state by replaying from init
      // Dispose and recreate with the target count
      const newRt = createLineageRuntime();
      runtimeRef.current = newRt;

      // Replay actions to reach target state
      for (let i = 1; i <= index; i++) {
        const node = timeline[i];
        if (node.action === "increment" || node.action === "decrement") {
          const action = newRt.MEL.actions[node.action as "increment" | "decrement"];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const intent = (newRt.createIntent as any)(action);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (newRt as any).commitAsync(intent);
        }
      }

      setSnapshot(newRt.getSnapshot());
      setActiveIndex(index);

      rt.dispose();
    },
    [activeIndex, timeline],
  );

  return (
    <section id="lineage" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Lineage &amp; Time Travel
          </h2>
          <p className="text-sm text-violet-400 font-medium mb-2">
            Not just undo — trace exactly why any value became what it is.
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every state change is tracked. Navigate through history and restore
            any previous state instantly.
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
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="text-sm text-muted">
                count ={" "}
                <span className="text-white font-mono font-bold text-lg">
                  {String(snapshot?.data.count ?? 0)}
                </span>
              </div>
              <button
                onClick={() => dispatchAction("increment")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors text-sm"
              >
                <Zap className="w-4 h-4" />
                increment()
              </button>
              <button
                onClick={() => dispatchAction("decrement")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-sm"
              >
                <Zap className="w-4 h-4" />
                decrement()
              </button>
            </div>

            {/* Timeline */}
            <div className="gradient-border">
              <div className="bg-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    State Timeline
                  </span>
                  <span className="text-xs text-muted ml-auto">
                    {timeline.length} state{timeline.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  ref={scrollRef}
                  className="overflow-x-auto py-4"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="flex items-center gap-1 min-w-min px-2">
                    {timeline.map((node, i) => {
                      const isActive = i === activeIndex;
                      const isFuture = i > activeIndex;

                      return (
                        <div key={`${node.worldId}-${i}`} className="flex items-center gap-1">
                          <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05 * Math.min(i, 5) }}
                            onClick={() => handleRestore(i)}
                            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all min-w-[64px] ${
                              isActive
                                ? "bg-violet-500/20 border-violet-500/60 shadow-lg shadow-violet-500/20"
                                : isFuture
                                  ? "bg-card border-border/30 opacity-40"
                                  : "bg-card border-border hover:border-violet-500/40 cursor-pointer"
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400"
                              />
                            )}
                            <span className="text-white font-mono text-sm font-bold">
                              {node.count}
                            </span>
                            <span className={`text-[10px] font-mono ${
                              isActive ? "text-violet-300" : "text-muted"
                            }`}>
                              {node.action === "init" ? "init" : `${node.action.slice(0, 3)}()`}
                            </span>
                          </motion.button>
                          {i < timeline.length - 1 && (
                            <div className={`w-4 h-px ${
                              i < activeIndex
                                ? "bg-violet-500/40"
                                : "bg-border/30"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeIndex > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-border">
                    <RotateCcw className="w-3 h-3 text-muted" />
                    <span className="text-xs text-muted">
                      Click any node to time-travel
                    </span>
                    {activeIndex < timeline.length - 1 && (
                      <span className="text-xs text-amber-400/80 font-mono ml-2">
                        (viewing past state)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Current State Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="gradient-border">
                <div className="bg-card rounded-xl p-5">
                  <div className="text-xs font-mono text-muted mb-3 uppercase tracking-wider">
                    Snapshot at Step {activeIndex}
                  </div>
                  <div className="font-mono text-sm space-y-2">
                    <div className="flex justify-between px-3 py-1.5 rounded-md bg-violet-500/5">
                      <span className="text-muted-foreground">data.count</span>
                      <span className="text-white font-bold">
                        {String(snapshot?.data.count ?? 0)}
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {snapshot?.computed && Object.entries(snapshot.computed).map(([key, value]) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-between px-3 py-1.5 rounded-md bg-violet-500/5"
                        >
                          <span className="text-muted-foreground">computed.{key}</span>
                          <span className="text-violet-300">{String(value)}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="gradient-border">
                <div className="bg-card rounded-xl p-5">
                  <div className="text-xs font-mono text-muted mb-3 uppercase tracking-wider">
                    History Log
                  </div>
                  <div className="font-mono text-xs space-y-1 max-h-[160px] overflow-y-auto">
                    {timeline.slice(0, activeIndex + 1).map((node, i) => (
                      <div
                        key={`log-${i}`}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md ${
                          i === activeIndex ? "bg-violet-500/10 text-violet-300" : "text-muted"
                        }`}
                      >
                        <span className="w-4 text-right">{i}.</span>
                        <span>{node.action === "init" ? "initial state" : `${node.action}()`}</span>
                        <span className="ml-auto text-muted-foreground">→ {node.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
