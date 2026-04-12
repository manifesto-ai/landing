"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Play, AlertTriangle, CheckCircle2, GitFork } from "lucide-react";
import { compile } from "@manifesto-ai/compiler";
import type { SchemaGraphNode, SchemaGraphEdge } from "@manifesto-ai/sdk";
import { createManifesto, type ManifestoBaseInstance, type Snapshot, type ManifestoDomainShape } from "@manifesto-ai/sdk";
import MelHighlighter from "./MelHighlighter";
import SchemaGraphD3 from "./SchemaGraphD3";

const presets: { label: string; mel: string }[] = [
  {
    label: "Counter",
    mel: `domain Counter {
  state {
    count: number = 0
  }

  computed doubled = mul(count, 2)
  computed isPositive = gt(count, 0)

  action increment() {
    onceIntent {
      patch count = add(count, 1)
    }
  }

  action decrement() {
    onceIntent {
      patch count = add(count, -1)
    }
  }
}`,
  },
  {
    label: "Temperature",
    mel: `domain Temperature {
  state {
    celsius: number = 0
  }

  computed fahrenheit = add(mul(celsius, 1.8), 32)
  computed kelvin = add(celsius, 273.15)
  computed isFreezing = lte(celsius, 0)
  computed isBoiling = gte(celsius, 100)

  action raise() {
    onceIntent {
      patch celsius = add(celsius, 10)
    }
  }

  action lower() {
    onceIntent {
      patch celsius = add(celsius, -10)
    }
  }
}`,
  },
  {
    label: "Score",
    mel: `domain Score {
  state {
    home: number = 0
    away: number = 0
  }

  computed total = add(home, away)
  computed isHomeLeading = gt(home, away)
  computed isDraw = eq(home, away)

  action homeScore() {
    onceIntent {
      patch home = add(home, 1)
    }
  }

  action awayScore() {
    onceIntent {
      patch away = add(away, 1)
    }
  }
}`,
  },
];

type CompileStatus = {
  success: boolean;
  errors: string[];
  warnings: string[];
};

export default function MelEditorSection() {
  const [mel, setMel] = useState(presets[0].mel);
  const [status, setStatus] = useState<CompileStatus>({ success: true, errors: [], warnings: [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instanceRef = useRef<ManifestoBaseInstance<any> | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<Record<string, unknown>> | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [graphNodes, setGraphNodes] = useState<SchemaGraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<SchemaGraphEdge[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const compileAndBoot = useCallback((source: string) => {
    try {
      const result = compile(source);

      if (!result.success || !result.schema) {
        setStatus({
          success: false,
          errors: result.errors.map((e) => `Line ${e.location?.start?.line ?? "?"}: ${e.message}`),
          warnings: result.warnings.map((w) => `Line ${w.location?.start?.line ?? "?"}: ${w.message}`),
        });
        return;
      }

      setStatus({
        success: true,
        errors: [],
        warnings: result.warnings.map((w) => `Line ${w.location?.start?.line ?? "?"}: ${w.message}`),
      });

      // Dispose previous instance
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = createManifesto<any>(result.schema as any, {}).activate();
      instanceRef.current = instance;

      setSnapshot(instance.getSnapshot());
      setActions(instance.getAvailableActions() as string[]);
      setReady(true);

      // Extract schema graph for visualization
      try {
        const graph = instance.getSchemaGraph();
        setGraphNodes([...graph.nodes]);
        setGraphEdges([...graph.edges]);
      } catch {
        setGraphNodes([]);
        setGraphEdges([]);
      }

      const unsub = instance.subscribe(
        (s: Snapshot<Record<string, unknown>>) => s,
        (s: Snapshot<Record<string, unknown>>) => setSnapshot(s),
      );

      // Store unsub for next compile
      (instanceRef.current as Record<string, unknown>).__unsub = unsub;
    } catch {
      setStatus({
        success: false,
        errors: ["Compilation failed unexpectedly"],
        warnings: [],
      });
    }
  }, []);

  useEffect(() => {
    compileAndBoot(presets[0].mel);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompile = useCallback(() => {
    if (instanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsub = (instanceRef.current as any).__unsub;
      if (typeof unsub === "function") unsub();
    }
    compileAndBoot(mel);
  }, [mel, compileAndBoot]);

  const handleDispatch = useCallback(
    async (actionName: string) => {
      if (!instanceRef.current) return;
      const rt = instanceRef.current;
      const action = rt.MEL.actions[actionName as keyof ManifestoDomainShape["actions"]];
      if (!action) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const intent = rt.createIntent(action as any, ...([] as any));
      await rt.dispatchAsync(intent);
    },
    [],
  );

  return (
    <section id="mel-editor" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            MEL Live Editor
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Edit state and computed definitions in real-time. See how changes
            propagate through the reactive system.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Presets */}
          <div className="flex items-center justify-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setMel(preset.mel);
                  if (instanceRef.current) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const unsub = (instanceRef.current as any).__unsub;
                    if (typeof unsub === "function") unsub();
                  }
                  compileAndBoot(preset.mel);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  mel === preset.mel
                    ? "bg-violet-600 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="gradient-border glow">
              <div className="bg-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    MEL Source
                  </span>
                  <button
                    onClick={handleCompile}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-600 text-white text-xs hover:bg-violet-700 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Compile &amp; Run
                  </button>
                </div>
                <div className="relative w-full h-[320px] rounded-lg bg-background border border-border focus-within:border-violet-500 overflow-hidden">
                  <div
                    ref={highlightRef}
                    className="absolute inset-0 px-4 py-3 overflow-auto pointer-events-none"
                    aria-hidden="true"
                  >
                    <MelHighlighter source={mel} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={mel}
                    onChange={(e) => setMel(e.target.value)}
                    onScroll={() => {
                      if (textareaRef.current && highlightRef.current) {
                        highlightRef.current.scrollTop = textareaRef.current.scrollTop;
                        highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
                      }
                    }}
                    spellCheck={false}
                    wrap="off"
                    className="absolute inset-0 w-full h-full px-4 py-3 bg-transparent text-transparent caret-white text-xs font-mono leading-relaxed whitespace-pre overflow-auto resize-none focus:outline-none selection:bg-violet-500/30"
                  />
                </div>

                {/* Status */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status.success ? "ok" : "err"}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    {status.success ? (
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Compiled successfully</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {status.errors.map((err, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-red-400"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="font-mono">{err}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {status.warnings.length > 0 &&
                      status.warnings.map((w, i) => (
                        <div
                          key={`w-${i}`}
                          className="flex items-start gap-2 text-xs text-amber-400 mt-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span className="font-mono">{w}</span>
                        </div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Live State */}
            <div className="space-y-4">
              {/* Actions */}
              {ready && actions.length > 0 && (
                <div className="gradient-border">
                  <div className="bg-card rounded-xl p-5">
                    <div className="text-xs font-mono text-muted mb-3 uppercase tracking-wider">
                      Available Actions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {actions.map((a) => (
                        <button
                          key={a}
                          onClick={() => handleDispatch(a)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-xs font-mono"
                        >
                          <Play className="w-3 h-3" />
                          {a}()
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* State */}
              {ready && snapshot && (
                <div className="gradient-border">
                  <div className="bg-card rounded-xl p-5">
                    <div className="text-xs font-mono text-muted mb-3 uppercase tracking-wider">
                      Live State
                    </div>
                    <div className="font-mono text-sm space-y-1.5">
                      {Object.entries(snapshot.data).map(([key, value]) => (
                        <motion.div
                          key={`data-${key}`}
                          layout
                          className="flex justify-between px-3 py-1.5 rounded-md bg-violet-500/5"
                        >
                          <span className="text-muted-foreground text-xs">
                            data.{key}
                          </span>
                          <motion.span
                            key={String(value)}
                            initial={{ scale: 1.2, color: "#a78bfa" }}
                            animate={{ scale: 1, color: "#ffffff" }}
                            className="text-xs font-bold"
                          >
                            {String(value)}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Computed */}
              {ready && snapshot?.computed && Object.keys(snapshot.computed).length > 0 && (
                <div className="gradient-border">
                  <div className="bg-card rounded-xl p-5">
                    <div className="text-xs font-mono text-muted mb-3 uppercase tracking-wider">
                      Computed Values
                    </div>
                    <div className="font-mono text-sm space-y-1.5">
                      {Object.entries(snapshot.computed).map(([key, value]) => (
                        <motion.div
                          key={`computed-${key}`}
                          layout
                          className="flex justify-between px-3 py-1.5 rounded-md bg-purple-500/5"
                        >
                          <span className="text-muted-foreground text-xs">
                            computed.{key}
                          </span>
                          <motion.span
                            key={String(value)}
                            initial={{ scale: 1.2, color: "#c084fc" }}
                            animate={{ scale: 1, color: "#c4b5fd" }}
                            className="text-xs font-bold"
                          >
                            {String(value)}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schema Graph */}
          {ready && graphNodes.length > 0 && (
            <div className="gradient-border">
              <div className="bg-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GitFork className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-mono text-muted uppercase tracking-wider">
                    getSchemaGraph() — Dependency Graph
                  </span>
                </div>

                <SchemaGraphD3
                  nodes={graphNodes}
                  edges={graphEdges}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

