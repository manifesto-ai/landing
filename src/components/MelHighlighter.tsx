"use client";

import { useMemo } from "react";
import { tokenize, type Token, type TokenKind } from "@manifesto-ai/compiler";

const TOKEN_COLORS: Partial<Record<TokenKind, string>> = {
  // Keywords
  DOMAIN: "text-violet-400 font-semibold",
  STATE: "text-violet-400 font-semibold",
  COMPUTED: "text-violet-400 font-semibold",
  ACTION: "text-violet-400 font-semibold",
  EFFECT: "text-violet-400 font-semibold",
  WHEN: "text-violet-400",
  ONCE: "text-violet-400",
  PATCH: "text-pink-400",
  UNSET: "text-pink-400",
  MERGE: "text-pink-400",
  TYPE: "text-violet-400 font-semibold",
  IMPORT: "text-violet-400",
  FROM: "text-violet-400",
  EXPORT: "text-violet-400",
  AS: "text-violet-400",
  AVAILABLE: "text-violet-400",
  DISPATCHABLE: "text-violet-400",
  FAIL: "text-red-400",
  STOP: "text-red-400",
  WITH: "text-violet-400",

  // Literals
  TRUE: "text-amber-400",
  FALSE: "text-amber-400",
  NULL: "text-amber-400",
  NUMBER: "text-amber-300",
  STRING: "text-green-400",

  // Identifiers
  IDENTIFIER: "text-sky-300",
  SYSTEM_IDENT: "text-cyan-400 italic",
  ITEM: "text-cyan-400 italic",

  // Operators
  EQ: "text-muted-foreground",
  EQ_EQ: "text-muted-foreground",
  BANG_EQ: "text-muted-foreground",
  LT: "text-muted-foreground",
  LT_EQ: "text-muted-foreground",
  GT: "text-muted-foreground",
  GT_EQ: "text-muted-foreground",

  // Punctuation
  LPAREN: "text-white/60",
  RPAREN: "text-white/60",
  LBRACE: "text-white/60",
  RBRACE: "text-white/60",
  LBRACKET: "text-white/60",
  RBRACKET: "text-white/60",
  COMMA: "text-white/40",
  DOT: "text-white/60",
  COLON: "text-white/60",

  // Error
  ERROR: "text-red-500 underline",
};

// Known builtin functions for special coloring
const BUILTINS = new Set([
  "add", "sub", "mul", "div", "mod", "neg", "abs", "min", "max", "floor", "ceil", "round",
  "eq", "neq", "gt", "gte", "lt", "lte", "and", "or", "not",
  "len", "append", "filter", "map", "find", "includes", "slice", "concat", "flat",
  "cond", "coalesce", "trim", "upper", "lower", "startsWith", "endsWith",
  "toString", "toNumber",
]);

function getTokenClass(token: Token): string {
  if (token.kind === "IDENTIFIER" && BUILTINS.has(token.lexeme)) {
    return "text-amber-400";
  }
  return TOKEN_COLORS[token.kind] ?? "text-white/80";
}

type HighlightedLine = { tokens: { text: string; className: string }[] };

function buildHighlightedLines(source: string): HighlightedLine[] {
  let tokens: Token[];
  try {
    const result = tokenize(source);
    tokens = result.tokens.filter((t) => t.kind !== "EOF");
  } catch {
    // If tokenizer fails, return plain text
    return source.split("\n").map((line) => ({
      tokens: [{ text: line, className: "text-white/80" }],
    }));
  }

  const lines = source.split("\n");
  const result: HighlightedLine[] = lines.map(() => ({ tokens: [] }));

  // Track which characters are covered by tokens
  const covered = new Array(source.length).fill(false);

  for (const token of tokens) {
    const startLine = token.location.start.line - 1;
    const startCol = token.location.start.column - 1;
    const endLine = token.location.end.line - 1;
    const endCol = token.location.end.column - 1;
    const className = getTokenClass(token);

    if (startLine === endLine) {
      // Single-line token
      const text = lines[startLine]?.slice(startCol, endCol) ?? token.lexeme;
      result[startLine]?.tokens.push({ text, className });

      // Mark covered
      let offset = 0;
      for (let i = 0; i < startLine; i++) offset += lines[i].length + 1;
      for (let i = startCol; i < endCol && offset + i < covered.length; i++) {
        covered[offset + i] = true;
      }
    } else {
      // Multi-line token (e.g., block comment) — treat as plain
      for (let l = startLine; l <= endLine; l++) {
        const sc = l === startLine ? startCol : 0;
        const ec = l === endLine ? endCol : lines[l]?.length ?? 0;
        const text = lines[l]?.slice(sc, ec) ?? "";
        result[l]?.tokens.push({ text, className });
      }
    }
  }

  // Fill gaps (whitespace between tokens)
  const finalResult: HighlightedLine[] = [];
  let globalOffset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineTokens = result[lineIdx]?.tokens ?? [];

    if (lineTokens.length === 0) {
      finalResult.push({ tokens: [{ text: line, className: "text-white/80" }] });
      globalOffset += line.length + 1;
      continue;
    }

    // Sort tokens by their position in the line
    const sortedTokens: { text: string; className: string; col: number }[] = [];
    let col = 0;

    for (const t of lineTokens) {
      const tCol = line.indexOf(t.text, col);
      if (tCol > col) {
        // Gap before this token
        sortedTokens.push({ text: line.slice(col, tCol), className: "text-white/80", col });
      }
      sortedTokens.push({ ...t, col: tCol >= 0 ? tCol : col });
      col = (tCol >= 0 ? tCol : col) + t.text.length;
    }

    if (col < line.length) {
      sortedTokens.push({ text: line.slice(col), className: "text-white/80", col });
    }

    finalResult.push({ tokens: sortedTokens.map(({ text, className }) => ({ text, className })) });
    globalOffset += line.length + 1;
  }

  return finalResult;
}

export default function MelHighlighter({ source }: { source: string }) {
  const highlighted = useMemo(() => buildHighlightedLines(source), [source]);

  return (
    <div className="font-mono text-xs leading-relaxed whitespace-pre">
      {highlighted.map((line, i) => (
        <span key={i}>
          {line.tokens.map((t, j) => (
            <span key={j} className={t.className}>
              {t.text}
            </span>
          ))}
          {i < highlighted.length - 1 ? "\n" : ""}
        </span>
      ))}
    </div>
  );
}
