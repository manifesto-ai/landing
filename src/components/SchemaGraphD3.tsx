"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import type { SchemaGraphNode, SchemaGraphEdge } from "@manifesto-ai/sdk";

/* ─── Types ─── */

interface GraphNode extends SimulationNodeDatum {
  id: string;
  kind: string;
  name: string;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  relation: string;
  sourceId: string;
  targetId: string;
}

/* ─── Constants ─── */

const KIND_COLORS: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  action:   { fill: "#78350f", stroke: "#d97706", text: "#fbbf24", bg: "rgba(217, 119, 6, 0.12)" },
  state:    { fill: "#0c4a6e", stroke: "#0ea5e9", text: "#7dd3fc", bg: "rgba(14, 165, 233, 0.12)" },
  computed: { fill: "#581c87", stroke: "#a855f7", text: "#c084fc", bg: "rgba(168, 85, 247, 0.12)" },
};

const EDGE_COLORS: Record<string, string> = {
  mutates: "#ef4444",
  feeds: "#a855f7",
  unlocks: "#22c55e",
};

const NODE_RADIUS = 8;
const LABEL_FONT = 10;

/* ─── Component ─── */

export default function SchemaGraphD3({
  nodes,
  edges,
}: {
  nodes: SchemaGraphNode[];
  edges: SchemaGraphEdge[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simRef = useRef<ReturnType<typeof forceSimulation<GraphNode>> | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);
  const [simLinks, setSimLinks] = useState<GraphLink[]>([]);
  const [settled, setSettled] = useState(false);
  const [kindFilter, setKindFilter] = useState<Set<string>>(new Set(["action", "state", "computed"]));
  const [searchQuery, setSearchQuery] = useState("");

  // Build simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const colX: Record<string, number> = { action: -200, state: 0, computed: 200 };
    const colCounts: Record<string, number> = { action: 0, state: 0, computed: 0 };

    const gNodes: GraphNode[] = nodes.map((n) => {
      const colIdx = colCounts[n.kind] ?? 0;
      colCounts[n.kind] = colIdx + 1;
      return {
        id: n.id,
        kind: n.kind,
        name: n.name,
        x: (colX[n.kind] ?? 0) + (Math.random() - 0.5) * 40,
        y: colIdx * 30 - ((colCounts[n.kind] ?? 1) * 30) / 2,
      };
    });

    const nodeMap = new Map(gNodes.map((n) => [n.id, n]));
    const gLinks: GraphLink[] = edges
      .filter((e) => nodeMap.has(e.from) && nodeMap.has(e.to))
      .map((e) => ({
        source: nodeMap.get(e.from)!,
        target: nodeMap.get(e.to)!,
        relation: e.relation,
        sourceId: e.from,
        targetId: e.to,
      }));

    const nodeCount = gNodes.length;
    const chargeStrength = nodeCount > 50 ? -80 : nodeCount > 20 ? -120 : -200;
    const linkDistance = nodeCount > 50 ? 60 : nodeCount > 20 ? 80 : 100;

    const sim = forceSimulation<GraphNode>(gNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(gLinks)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force("charge", forceManyBody().strength(chargeStrength))
      .force("center", forceCenter(0, 0))
      .force("collide", forceCollide(nodeCount > 50 ? 16 : 24))
      .force("x", forceX<GraphNode>().x((d) => colX[d.kind] ?? 0).strength(0.15))
      .force("y", forceY<GraphNode>().y(0).strength(0.05));

    simRef.current = sim;
    setSettled(false);

    sim.on("tick", () => {
      setSimNodes([...gNodes]);
      setSimLinks([...gLinks]);
    });

    sim.on("end", () => {
      setSettled(true);
    });

    if (nodeCount > 50) {
      sim.alphaDecay(0.05);
    }

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [nodes, edges]);

  // Setup zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter((event) => {
        // Allow zoom on wheel and drag on background only (not on nodes)
        if (event.type === "wheel") return true;
        if (event.type === "mousedown" || event.type === "touchstart") {
          // Only allow pan when not on a draggable node
          return !(event.target as HTMLElement).closest?.("[data-draggable]");
        }
        return true;
      })
      .on("zoom", (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      });

    select(svg).call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    return () => {
      select(svg).on(".zoom", null);
    };
  }, []);

  // Node drag via React pointer events
  const dragNodeRef = useRef<GraphNode | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, node: GraphNode) => {
    e.stopPropagation();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    dragNodeRef.current = node;
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    node.fx = node.x;
    node.fy = node.y;
    if (simRef.current) {
      simRef.current.alphaTarget(0.3).restart();
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const node = dragNodeRef.current;
    if (!node || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.moved = true;
    }
    // Convert screen delta to graph coordinates (account for zoom scale)
    node.fx = (node.fx ?? 0) + (e.movementX / transform.k);
    node.fy = (node.fy ?? 0) + (e.movementY / transform.k);
  }, [transform.k]);

  const handlePointerUp = useCallback(() => {
    const node = dragNodeRef.current;
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    if (simRef.current) {
      simRef.current.alphaTarget(0);
    }
    dragNodeRef.current = null;
    // NOTE: don't clear dragStartRef here — onClick needs it
  }, []);

  // Auto-fit when simulation settles
  useEffect(() => {
    if (!settled || simNodes.length === 0 || !svgRef.current || !zoomRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const padding = 60;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x - 80);
        maxX = Math.max(maxX, n.x + 80);
        minY = Math.min(minY, n.y - 30);
        maxY = Math.max(maxY, n.y + 30);
      }
    });

    const graphW = maxX - minX;
    const graphH = maxY - minY;
    const scale = Math.min(
      (rect.width - padding * 2) / graphW,
      (rect.height - padding * 2) / graphH,
      2
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    select(svg)
      .transition()
      .duration(500)
      .call(
        zoomRef.current.transform,
        zoomIdentity
          .translate(rect.width / 2, rect.height / 2)
          .scale(scale)
          .translate(-cx, -cy)
      );
  }, [settled, simNodes]);

  // Zoom to fit button
  const handleFitView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || simNodes.length === 0) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const padding = 60;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x - 80);
        maxX = Math.max(maxX, n.x + 80);
        minY = Math.min(minY, n.y - 30);
        maxY = Math.max(maxY, n.y + 30);
      }
    });

    const graphW = maxX - minX;
    const graphH = maxY - minY;
    const scale = Math.min(
      (rect.width - padding * 2) / graphW,
      (rect.height - padding * 2) / graphH,
      2
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    select(svg)
      .transition()
      .duration(300)
      .call(
        zoomRef.current.transform,
        zoomIdentity
          .translate(rect.width / 2, rect.height / 2)
          .scale(scale)
          .translate(-cx, -cy)
      );
  }, [simNodes]);

  // Zoom to selected node + connected neighbors
  // Centers on clicked node and scales so all connected nodes fit in viewport
  const zoomToNode = useCallback((nodeId: string) => {
    if (!svgRef.current || !zoomRef.current) return;

    const centerNode = simNodes.find((n) => n.id === nodeId);
    if (!centerNode || centerNode.x === undefined || centerNode.y === undefined) return;

    // Gather connected node IDs
    const related = new Set<string>([nodeId]);
    simLinks.forEach((link) => {
      if (link.sourceId === nodeId || link.targetId === nodeId) {
        related.add(link.sourceId);
        related.add(link.targetId);
      }
    });

    const relatedNodes = simNodes.filter((n) => related.has(n.id));
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    // Compute the max distance from center node to any connected node
    // This determines the scale needed to fit all related nodes in viewport
    let maxDx = 0;
    let maxDy = 0;
    relatedNodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        maxDx = Math.max(maxDx, Math.abs(n.x - centerNode.x!));
        maxDy = Math.max(maxDy, Math.abs(n.y - centerNode.y!));
      }
    });

    // Add margin for node labels and breathing room
    const labelMargin = 80;
    maxDx += labelMargin;
    maxDy += labelMargin;

    // Scale so the farthest connected node fits within half the viewport
    const padding = 40;
    const scaleX = maxDx > 0 ? (halfW - padding) / maxDx : 3;
    const scaleY = maxDy > 0 ? (halfH - padding) / maxDy : 3;
    const scale = Math.min(scaleX, scaleY, 3);

    select(svg)
      .transition()
      .duration(500)
      .call(
        zoomRef.current.transform,
        zoomIdentity
          .translate(halfW, halfH)
          .scale(scale)
          .translate(-centerNode.x, -centerNode.y)
      );
  }, [simNodes, simLinks]);

  // Highlight logic
  const activeNode = hoveredNode ?? selectedNode;
  const connectedNodes = new Set<string>();
  const connectedEdges = new Set<number>();
  if (activeNode) {
    connectedNodes.add(activeNode);
    simLinks.forEach((link, i) => {
      if (link.sourceId === activeNode || link.targetId === activeNode) {
        connectedEdges.add(i);
        connectedNodes.add(link.sourceId);
        connectedNodes.add(link.targetId);
      }
    });
  }

  // Filter logic
  const filteredNodeIds = new Set(
    simNodes
      .filter((n) => kindFilter.has(n.kind))
      .filter((n) => !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((n) => n.id)
  );

  const toggleKind = (kind: string) => {
    setKindFilter((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) {
        if (next.size > 1) next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  };

  // Selected node details
  const selectedNodeData = selectedNode ? simNodes.find((n) => n.id === selectedNode) : null;
  const selectedEdges = selectedNode
    ? simLinks.filter((l) => l.sourceId === selectedNode || l.targetId === selectedNode)
    : [];

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Kind filters */}
        {Object.entries(KIND_COLORS).map(([kind, colors]) => (
          <button
            key={kind}
            onClick={() => toggleKind(kind)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all"
            style={{
              background: kindFilter.has(kind) ? colors.bg : "transparent",
              border: `1px solid ${kindFilter.has(kind) ? colors.stroke : "rgba(255,255,255,0.1)"}`,
              color: kindFilter.has(kind) ? colors.text : "rgba(255,255,255,0.3)",
              opacity: kindFilter.has(kind) ? 1 : 0.5,
            }}
          >
            <svg width="10" height="10">
              <circle cx="5" cy="5" r="4" fill={`${colors.fill}80`} stroke={colors.stroke} strokeWidth="1.5" />
            </svg>
            {kind}
            <span className="text-white/30 ml-0.5">
              {simNodes.filter((n) => n.kind === kind).length}
            </span>
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-40 px-2.5 py-1 rounded-md bg-background/50 border border-border text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Graph */}
      <div className="relative w-full h-[500px] rounded-lg bg-background/50 border border-border overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Arrow markers */}
            {Object.entries(EDGE_COLORS).map(([rel, color]) => (
              <marker
                key={rel}
                id={`arrow-${rel}`}
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            ))}
            {/* Glow filter */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            ref={gRef}
            transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
          >
            {/* Edges */}
            {simLinks.map((link, i) => {
              const source = link.source as GraphNode;
              const target = link.target as GraphNode;
              if (source.x === undefined || target.x === undefined) return null;

              const sourceVisible = filteredNodeIds.has(link.sourceId);
              const targetVisible = filteredNodeIds.has(link.targetId);
              if (!sourceVisible || !targetVisible) return null;

              const isHighlighted = activeNode === null || connectedEdges.has(i);
              const color = EDGE_COLORS[link.relation] ?? "#666";

              const dx = (target.x ?? 0) - (source.x ?? 0);
              const dy = (target.y ?? 0) - (source.y ?? 0);
              const dr = Math.sqrt(dx * dx + dy * dy) * 0.6;

              return (
                <g key={`edge-${i}`} style={{ opacity: isHighlighted ? 0.7 : 0.08, transition: "opacity 0.2s" }}>
                  <path
                    d={`M ${source.x},${source.y} A ${dr},${dr} 0 0,1 ${target.x},${target.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted && activeNode ? 2.5 : 1.5}
                    strokeDasharray={link.relation === "unlocks" ? "4 3" : "none"}
                    markerEnd={`url(#arrow-${link.relation})`}
                    style={{ transition: "stroke-width 0.2s" }}
                  />
                  {/* Edge label on highlight */}
                  {isHighlighted && activeNode && (
                    <text
                      x={((source.x ?? 0) + (target.x ?? 0)) / 2}
                      y={((source.y ?? 0) + (target.y ?? 0)) / 2 - 6}
                      textAnchor="middle"
                      style={{
                        fill: color,
                        fontSize: 7,
                        fontFamily: "monospace",
                        opacity: 0.8,
                      }}
                    >
                      {link.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {simNodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              if (!filteredNodeIds.has(node.id)) return null;

              const colors = KIND_COLORS[node.kind] ?? KIND_COLORS.state;
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const isDimmed = activeNode !== null && !connectedNodes.has(node.id);
              const isSearchMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
              const nodeScale = isHovered ? 1.3 : isSelected ? 1.15 : 1;

              return (
                <g
                  key={node.id}
                  data-draggable="true"
                  data-node-id={node.id}
                  onPointerDown={(e) => handleNodePointerDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    const wasDragged = dragStartRef.current?.moved;
                    dragStartRef.current = null;
                    if (wasDragged) return;
                    const nextId = isSelected ? null : node.id;
                    setSelectedNode(nextId);
                    if (nextId) {
                      zoomToNode(nextId);
                    } else {
                      handleFitView();
                    }
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    cursor: "grab",
                    opacity: isDimmed ? 0.1 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Search highlight ring */}
                  {isSearchMatch && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS + 10}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                      opacity={0.6}
                    />
                  )}
                  {/* Glow for selected/hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS * nodeScale + 8}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth={1}
                      opacity={0.3}
                      filter="url(#node-glow)"
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS * nodeScale}
                    fill={`${colors.fill}${isHovered || isSelected ? "cc" : "80"}`}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                    style={{ transition: "r 0.15s, stroke-width 0.15s" }}
                  />
                  {/* Label background pill */}
                  <rect
                    x={node.x - node.name.length * 2.8}
                    y={(node.y ?? 0) + NODE_RADIUS + 4}
                    width={node.name.length * 5.6}
                    height={14}
                    rx={3}
                    fill={isDimmed ? "transparent" : "rgba(15, 10, 26, 0.85)"}
                    stroke={isDimmed ? "transparent" : `${colors.stroke}30`}
                    strokeWidth={0.5}
                  />
                  {/* Label text */}
                  <text
                    x={node.x}
                    y={(node.y ?? 0) + NODE_RADIUS + 14}
                    textAnchor="middle"
                    style={{
                      fill: isHovered || isSelected ? "#fff" : colors.text,
                      fontSize: LABEL_FONT,
                      fontFamily: "monospace",
                      fontWeight: isSelected ? 700 : isHovered ? 600 : 400,
                      pointerEvents: "none",
                      transition: "fill 0.15s",
                    }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Controls overlay */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={handleFitView}
            className="px-2.5 py-1 rounded-md bg-card/90 border border-border text-xs text-muted-foreground hover:text-white hover:border-violet-500/30 transition-colors backdrop-blur-sm"
          >
            Fit
          </button>
          <button
            onClick={() => { setSelectedNode(null); handleFitView(); }}
            className="px-2.5 py-1 rounded-md bg-card/90 border border-border text-xs text-muted-foreground hover:text-white hover:border-violet-500/30 transition-colors backdrop-blur-sm"
            style={{ opacity: selectedNode ? 1 : 0.3 }}
          >
            Clear
          </button>
        </div>

        {/* Node info panel */}
        {selectedNodeData && (
          <div className="absolute bottom-3 right-3 max-w-[220px] p-3 rounded-lg bg-card/95 border border-border backdrop-blur-sm text-xs font-mono">
            <div className="flex items-center gap-2 mb-2">
              <svg width="12" height="12">
                <circle
                  cx="6" cy="6" r="5"
                  fill={`${(KIND_COLORS[selectedNodeData.kind] ?? KIND_COLORS.state).fill}80`}
                  stroke={(KIND_COLORS[selectedNodeData.kind] ?? KIND_COLORS.state).stroke}
                  strokeWidth="1.5"
                />
              </svg>
              <span className="text-white font-bold truncate">{selectedNodeData.name}</span>
              <span
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: (KIND_COLORS[selectedNodeData.kind] ?? KIND_COLORS.state).bg,
                  color: (KIND_COLORS[selectedNodeData.kind] ?? KIND_COLORS.state).text,
                }}
              >
                {selectedNodeData.kind}
              </span>
            </div>
            {selectedEdges.length > 0 && (
              <div className="space-y-1 border-t border-border/50 pt-2">
                {selectedEdges.map((e, i) => {
                  const isOutgoing = e.sourceId === selectedNode;
                  const otherName = simNodes.find((n) => n.id === (isOutgoing ? e.targetId : e.sourceId))?.name ?? "?";
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                      <span style={{ color: EDGE_COLORS[e.relation] ?? "#666" }}>
                        {isOutgoing ? "→" : "←"}
                      </span>
                      <span style={{ color: EDGE_COLORS[e.relation] ?? "#666" }}>{e.relation}</span>
                      <span className="text-white/70 truncate">{otherName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Node count */}
        <div className="absolute bottom-3 left-3 text-xs text-muted font-mono">
          {filteredNodeIds.size}/{nodes.length} nodes · {edges.length} edges
          {!settled && <span className="ml-2 text-violet-400 animate-pulse">computing layout...</span>}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted px-1 flex-wrap">
        {Object.entries(EDGE_COLORS).map(([rel, color]) => (
          <div key={rel} className="flex items-center gap-1.5">
            <svg width="20" height="10">
              <line x1="0" y1="5" x2="16" y2="5" stroke={color} strokeWidth={1.5} strokeDasharray={rel === "unlocks" ? "3 3" : "none"} />
              <circle cx="18" cy="5" r="2" fill={color} />
            </svg>
            <span className="font-mono">{rel}</span>
          </div>
        ))}
        <span className="ml-auto text-muted-foreground">scroll to zoom · drag node to move · click to trace</span>
      </div>
    </div>
  );
}
