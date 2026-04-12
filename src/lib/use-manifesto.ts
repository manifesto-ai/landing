"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  ManifestoDomainShape,
  ManifestoBaseInstance,
  Snapshot,
  EffectHandler,
} from "@manifesto-ai/sdk";
import { createManifesto } from "@manifesto-ai/sdk";

export function useManifesto<T extends ManifestoDomainShape>(
  schema: string,
  effects?: Record<string, EffectHandler>,
) {
  const instanceRef = useRef<ManifestoBaseInstance<T> | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<T["state"]> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const manifesto = createManifesto<T>(schema, effects ?? {});
    const instance = manifesto.activate();
    instanceRef.current = instance;

    setSnapshot(instance.getSnapshot());
    setReady(true);

    const unsub = instance.subscribe(
      (s) => s,
      (s) => setSnapshot(s),
    );

    return () => {
      unsub();
      instance.dispose();
      instanceRef.current = null;
      setReady(false);
    };
  }, [schema, effects]);

  const dispatch = useCallback(
    async (...args: Parameters<ManifestoBaseInstance<T>["dispatchAsync"]>) => {
      if (!instanceRef.current) return null;
      return instanceRef.current.dispatchAsync(...args);
    },
    [],
  );

  return {
    instance: instanceRef.current,
    snapshot,
    ready,
    dispatch,
    get MEL() {
      return instanceRef.current?.MEL ?? null;
    },
  };
}
