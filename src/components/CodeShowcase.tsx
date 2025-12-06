"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, FileCode, Sparkles, Terminal, Bot } from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "schema",
    label: "1. Define Schema",
    icon: FileCode,
  },
  {
    id: "render",
    label: "2. Render",
    icon: Terminal,
  },
  {
    id: "session",
    label: "3. AI Session",
    icon: Bot,
  },
  {
    id: "snapshot",
    label: "4. Snapshot",
    icon: Sparkles,
  },
];

const codeBlocks = {
  schema: {
    language: "typescript",
    filename: "schema.ts",
    code: `import { entity, field, view, section, viewField, layout } from '@manifesto-ai/schema'

// Data model
const productEntity = entity('product', 'Product', '1.0.0')
  .field(field.string('name').label('Product Name').required())
  .field(field.number('price').label('Price').min(0))
  .field(field.enum('category', [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
  ]).label('Category'))
  .build()

// UI layout
const productView = view('product-form', 'Create Product', '1.0.0')
  .entityRef('product')
  .layout(layout.form())
  .section(
    section('basic')
      .title('Basic Info')
      .field(viewField.textInput('name', 'name'))
      .field(viewField.numberInput('price', 'price'))
      .field(viewField.select('category', 'category'))
  )
  .build()`,
  },
  render: {
    language: "tsx",
    filename: "ProductForm.tsx",
    code: `import { FormRenderer } from '@manifesto-ai/react'
import '@manifesto-ai/react/styles'

<FormRenderer
  schema={productView}
  entitySchema={productEntity}
  onSubmit={(data) => console.log(data)}
/>`,
  },
  session: {
    language: "typescript",
    filename: "ai-session.ts",
    code: `import { createFormRuntime } from '@manifesto-ai/engine'
import { createInteroperabilitySession } from '@manifesto-ai/ai-util'

const runtime = createFormRuntime(productView, { entitySchema: productEntity })
const session = createInteroperabilitySession({
  runtime,
  viewSchema: productView,
  entitySchema: productEntity
})

// Export complete semantic state
const snapshot = session.snapshot()

// AI dispatches validated actions
session.dispatch({
  type: 'setValue',
  field: 'name',
  value: 'AI Generated Product'
})`,
  },
  snapshot: {
    language: "json",
    filename: "semantic-snapshot.json",
    code: `{
  "fields": {
    "name": {
      "value": "",
      "type": "string",
      "required": true,
      "visible": true,
      "disabled": false,
      "validation": { "valid": false, "errors": ["Required field"] }
    },
    "price": {
      "value": 0,
      "type": "number",
      "constraints": { "min": 0 }
    },
    "category": {
      "value": null,
      "options": [
        { "value": "electronics", "label": "Electronics" },
        { "value": "clothing", "label": "Clothing" }
      ]
    }
  },
  "availableActions": ["submit", "reset", "setValue"],
  "formState": { "dirty": false, "valid": false, "submitting": false }
}`,
  },
};

function CodeBlock({ code, language, filename }: { code: string; language: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightSyntax = (code: string, lang: string) => {
    if (lang === "json") {
      return code
        .replace(/"([^"]+)":/g, '<span class="text-cyan-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>')
        .replace(/: (\[.*?\])/g, ': <span class="text-emerald-400">$1</span>');
    }

    if (lang === "typescript" || lang === "tsx") {
      return code
        .replace(/(import|from|const|function|return|export)/g, '<span class="text-purple-400">$1</span>')
        .replace(/('[@\w\/-]+')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(\.[a-zA-Z]+)\(/g, '<span class="text-cyan-400">$1</span>(')
        .replace(/(\/\/.*$)/gm, '<span class="text-slate-500">$1</span>');
    }

    return code;
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="ml-3 text-sm text-slate-400 font-mono">{filename}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700/50"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code
            className="font-mono text-slate-300"
            dangerouslySetInnerHTML={{ __html: highlightSyntax(code, language) }}
          />
        </pre>
      </div>
    </div>
  );
}

export default function CodeShowcase() {
  const [activeTab, setActiveTab] = useState("schema");

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400">
            Define your schema, render it with your framework, and let AI
            understand everything about your form.
          </p>
        </motion.div>

        {/* Code Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-white bg-slate-800/50 border-b-2 border-emerald-500"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/30"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split('. ')[1]}</span>
                  {tab.id === "snapshot" && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded hidden sm:inline">
                      Magic
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CodeBlock
                  code={codeBlocks[activeTab as keyof typeof codeBlocks].code}
                  language={codeBlocks[activeTab as keyof typeof codeBlocks].language}
                  filename={codeBlocks[activeTab as keyof typeof codeBlocks].filename}
                />
              </motion.div>
            </AnimatePresence>

            {/* Tab-specific highlights */}
            {activeTab === "session" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4"
              >
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                  <p className="text-sm text-slate-300">
                    <span className="text-purple-400 font-medium">AI Interoperability:</span>{" "}
                    Create a session to export semantic state and let AI dispatch validated actions directly to your form.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "snapshot" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4"
              >
                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                  <p className="text-sm text-slate-300">
                    <span className="text-emerald-400 font-medium">This is what AI sees:</span>{" "}
                    Complete semantic state including field values, validation rules,
                    constraints, and available actions. No more guessing from pixels!
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
