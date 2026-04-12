"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity } from "lucide-react";
import { useManifesto } from "@/lib/use-manifesto";
import { counterMel, type CounterDomain } from "@/lib/domains";

type FlowStage = "idle" | "intent" | "core" | "patches" | "host" | "snapshot";

const stages: { id: FlowStage; label: string; description: string }[] = [
  { id: "intent", label: "Intent", description: "Action dispatched" },
  { id: "core", label: "Core", description: "Pure computation" },
  { id: "patches", label: "Patches", description: "Changes generated" },
  { id: "host", label: "Host", description: "Applying patches" },
  { id: "snapshot", label: "Snapshot", description: "New state ready" },
];

type EventLog = {
  id: number;
  type: string;
  intentId: string;
  action: string;
  timestamp: number;
};

export default function FlowXRaySection() {
  const { instance, snapshot, ready } = useManifesto<CounterDomain>(counterMel);
  const [activeStage, setActiveStage] = useState<FlowStage>("idle");
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const eventIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!instance) return;

    const unsubs = [
      instance.on("dispatch:completed", (payload) => {
        const evt: EventLog = {
          id: ++eventIdRef.current,
          type: "completed",
          intentId: payload.intentId.slice(0, 8),
          action: String((payload.intent as Record<string, unknown>).type ?? "unknown"),
          timestamp: Date.now(),
        };
        setEvents((prev) => [evt, ...prev].slice(0, 10));
      }),
      instance.on("dispatch:rejected", (payload) => {
        const evt: EventLog = {
          id: ++eventIdRef.current,
          type: "rejected",
          intentId: payload.intentId.slice(0, 8),
          action: payload.code,
          timestamp: Date.now(),
        };
        setEvents((prev) => [evt, ...prev].slice(0, 10));
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [instance]);

  const activeIndex = useMemo(
    () => stages.findIndex((s) => s.id === activeStage),
    [activeStage],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (activeIndex < 0) {
      container.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const node = nodeRefs.current[activeIndex];
    if (!node) return;
    const scrollLeft =
      node.offsetLeft - container.offsetWidth / 2 + node.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
  }, [activeIndex]);

  const animateFlow = useCallback(
    async (actionName: string) => {
      if (!instance || isAnimating) return;
      setIsAnimating(true);

      const stageIds: FlowStage[] = ["intent", "core", "patches", "host", "snapshot"];

      for (const stage of stageIds) {
        setActiveStage(stage);
        await new Promise((r) => setTimeout(r, 400));
      }

      const action = instance.MEL.actions[actionName as keyof CounterDomain["actions"]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intent = instance.createIntent(action, ...([] as any));
      await instance.dispatchAsync(intent);

      await new Promise((r) => setTimeout(r, 600));
      setActiveStage("idle");
      setIsAnimating(false);
    },
    [instance, isAnimating],
  );

  return (
    <section id="flow-xray" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Flow X-Ray
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch the internal pipeline in real-time. Every dispatch flows
            through five deterministic stages.
          </p>
        </motion.div>

        {!ready ? (
          <div className="text-center text-muted p-8">Loading runtime...</div>
        ) : (
          <div className="space-y-8">
            {/* Flow Pipeline */}
            <div
              ref={scrollRef}
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible py-4 px-4 sm:px-0 sm:justify-center"
              style={{ scrollbarWidth: "none" }}
            >
              {stages.map((stage, i) => {
                const isActive = activeStage === stage.id;
                const isPast = activeIndex >= 0 && i < activeIndex;

                return (
                  <div
                    key={stage.id}
                    ref={(el) => { nodeRefs.current[i] = el; }}
                    className="flex items-center gap-2 sm:gap-4 shrink-0"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        borderColor: isActive
                          ? "rgba(124, 58, 237, 0.8)"
                          : isPast
                            ? "rgba(124, 58, 237, 0.3)"
                            : "rgba(45, 35, 69, 1)",
                        backgroundColor: isActive
                          ? "rgba(124, 58, 237, 0.15)"
                          : "rgba(26, 20, 41, 1)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center p-3 rounded-xl border min-w-[72px] sm:min-w-[100px]"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mb-2 transition-colors ${
                          isActive
                            ? "bg-violet-500 shadow-lg shadow-violet-500/50"
                            : isPast
                              ? "bg-violet-500/40"
                              : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? "text-violet-300" : isPast ? "text-violet-400/60" : "text-muted"
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="text-[10px] text-muted mt-0.5 hidden sm:block">
                        {stage.description}
                      </span>
                    </motion.div>
                    {i < stages.length - 1 && (
                      <motion.div
                        animate={{
                          backgroundColor:
                            isPast || isActive
                              ? "rgba(124, 58, 237, 0.5)"
                              : "rgba(45, 35, 69, 0.5)",
                        }}
                        className="w-6 sm:w-10 h-0.5 rounded-full"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons + Current State */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="text-sm text-muted">
                count ={" "}
                <span className="text-white font-mono font-bold">
                  {String(snapshot?.data.count ?? 0)}
                </span>
              </div>
              <button
                onClick={() => animateFlow("increment")}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors text-sm disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Dispatch increment()
              </button>
              <button
                onClick={() => animateFlow("decrement")}
                disabled={isAnimating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-sm disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                Dispatch decrement()
              </button>
            </div>

            {/* Event Log */}
            <div className="gradient-border">
              <div className="bg-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    Event Log
                  </span>
                </div>
                <div className="font-mono text-xs space-y-1 min-h-[80px] max-h-[200px] overflow-y-auto">
                  <AnimatePresence>
                    {events.length === 0 ? (
                      <div className="text-muted text-center py-4">
                        Dispatch an action to see events
                      </div>
                    ) : (
                      events.map((evt) => (
                        <motion.div
                          key={evt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-violet-500/5"
                        >
                          <span
                            className={
                              evt.type === "completed"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {evt.type}
                          </span>
                          <span className="text-muted-foreground">
                            id:{evt.intentId}
                          </span>
                          <span className="text-violet-400">{evt.action}</span>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
