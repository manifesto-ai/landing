"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Send, RotateCcw, Check, AlertCircle } from "lucide-react";

import {
  entity,
  field,
  view,
  section,
  viewField,
  layout,
  enumValue,
} from "@manifesto-ai/schema";
import { createFormRuntime, type FormState } from "@manifesto-ai/engine";
import {
  createInteroperabilitySession,
  type SemanticSnapshot,
} from "@manifesto-ai/ai-util";
import { createHighlightManager, type HighlightManager } from "@manifesto-ai/ui";

// Field labels map
const fieldLabels: Record<string, string> = {
  name: "Full Name",
  email: "Email Address",
  inquiry_type: "Inquiry Type",
  message: "Message",
};

// Define schemas
const contactEntity = entity("contact", "Contact Form", "1.0.0")
  .field(field.string("name", "Full Name").required().build())
  .field(
    field
      .string("email", "Email Address")
      .required()
      .pattern("^[^@]+@[^@]+\\.[^@]+$")
      .build()
  )
  .field(
    field.enum("inquiry_type", "Inquiry Type", [
      enumValue("general", "General Inquiry"),
      enumValue("support", "Technical Support"),
      enumValue("sales", "Sales"),
    ]).build()
  )
  .field(field.string("message", "Message").required().build())
  .build();

const contactView = view("contact-form", "Contact Us", "1.0.0")
  .entityRef("contact")
  .mode("create")
  .layout(layout.form())
  .section(
    section("contact")
      .title("Contact Information")
      .field(viewField.textInput("name", "name").build())
      .field(viewField.textInput("email", "email").build())
      .field(viewField.select("inquiry_type", "inquiry_type").build())
      .field(viewField.textarea("message", "message").build())
      .build()
  )
  .build();

// AI Assistant messages
const aiMessages = [
  "Hello! I can help you fill out this form. I have full semantic understanding of all fields.",
  "I see 'name' is required and empty. Would you like me to fill it?",
  "The email field requires a valid email format. I can validate it before submission.",
];

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function InteractiveDemo() {
  const [formState, setFormState] = useState<FormState | null>(null);
  const [snapshot, setSnapshot] = useState<SemanticSnapshot | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I can see this form has 4 fields. Let me analyze them...",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "snapshot">("form");
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  const highlightManagerRef = useRef<HighlightManager | null>(null);

  // Initialize highlight manager
  useEffect(() => {
    const manager = createHighlightManager();
    highlightManagerRef.current = manager;

    const unsubscribe = manager.subscribe((fieldPath, state) => {
      setHighlightedFields((prev) => {
        const next = new Set(prev);
        if (state?.active) {
          next.add(fieldPath);
        } else {
          next.delete(fieldPath);
        }
        return next;
      });
    });

    return () => {
      unsubscribe();
      manager.dispose();
    };
  }, []);

  // Initialize runtime and session
  const { runtime, session } = useMemo(() => {
    const rt = createFormRuntime(contactView, {
      entitySchema: contactEntity,
      initialValues: {},
    });
    rt.initialize();

    const sess = createInteroperabilitySession({
      runtime: rt,
      viewSchema: contactView,
      entitySchema: contactEntity,
    });

    return { runtime: rt, session: sess };
  }, []);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = runtime.subscribe((state) => {
      setFormState(state);
      setSnapshot(session.snapshot());
    });

    // Initial state
    setFormState(runtime.getState());
    setSnapshot(session.snapshot());

    return unsubscribe;
  }, [runtime, session]);

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldId: string, value: unknown) => {
      runtime.dispatch({ type: "FIELD_CHANGE", fieldId, value });
    },
    [runtime]
  );

  // Highlight field with animation
  const highlightField = useCallback((fieldId: string) => {
    highlightManagerRef.current?.highlight({
      type: "value-change",
      fieldPath: fieldId,
      duration: 1500,
      intensity: "strong",
    });
  }, []);

  // Highlight multiple fields in chain
  const highlightChain = useCallback((fieldIds: string[]) => {
    highlightManagerRef.current?.highlightChain(fieldIds, "value-change", {
      duration: 1500,
      intensity: "strong",
      chainDelay: 200,
    });
  }, []);

  // Handle AI command
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerInput = inputValue.toLowerCase();
    let response = "";

    // Simple command parsing
    if (lowerInput.includes("fill") && lowerInput.includes("name")) {
      session.dispatch({ type: "updateField", fieldId: "name", value: "John Doe" });
      highlightField("name");
      response = "Done! I've filled the name field with 'John Doe'.";
    } else if (lowerInput.includes("fill") && lowerInput.includes("email")) {
      session.dispatch({ type: "updateField", fieldId: "email", value: "john@example.com" });
      highlightField("email");
      response = "Done! I've set the email to 'john@example.com'.";
    } else if (lowerInput.includes("fill") && lowerInput.includes("all")) {
      session.dispatch({ type: "updateField", fieldId: "name", value: "John Doe" });
      session.dispatch({ type: "updateField", fieldId: "email", value: "john@example.com" });
      session.dispatch({ type: "updateField", fieldId: "inquiry_type", value: "general" });
      session.dispatch({ type: "updateField", fieldId: "message", value: "Hello, I would like to learn more about Manifesto AI." });
      highlightChain(["name", "email", "inquiry_type", "message"]);
      response = "Done! I've filled all the form fields with sample data.";
    } else if (lowerInput.includes("reset") || lowerInput.includes("clear")) {
      session.dispatch({ type: "reset" });
      response = "Form has been reset.";
    } else if (lowerInput.includes("validate") || lowerInput.includes("check")) {
      const snap = session.snapshot();
      const invalidFields = Object.entries(snap.state.fields)
        .filter(([, f]) => !f.meta.valid)
        .map(([id]) => id);
      if (invalidFields.length === 0) {
        response = "All fields are valid! The form is ready to submit.";
      } else {
        highlightChain(invalidFields);
        response = `Found ${invalidFields.length} invalid field(s): ${invalidFields.join(", ")}. These need to be filled correctly.`;
      }
    } else if (lowerInput.includes("status") || lowerInput.includes("snapshot")) {
      const snap = session.snapshot();
      response = `Form Status:\n- Valid: ${snap.state.form.isValid}\n- Dirty: ${snap.state.form.isDirty}\n- Fields: ${Object.keys(snap.state.fields).length}`;
    } else {
      response = aiMessages[Math.floor(Math.random() * aiMessages.length)];
    }

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  }, [inputValue, session, highlightField, highlightChain]);

  // Get highlight class for field
  const getHighlightClass = (fieldId: string) => {
    if (highlightedFields.has(fieldId)) {
      return "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse";
    }
    return "";
  };

  // Render field
  const renderField = (fieldId: string) => {
    if (!formState) return null;

    const meta = formState.fields.get(fieldId);
    const value = formState.values[fieldId] ?? "";
    const options = formState.fieldOptions.get(fieldId);
    const label = fieldLabels[fieldId] || fieldId;

    if (!meta) return null;

    const baseInputClass =
      "w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all";
    const errorClass = meta.errors.length > 0 ? "border-red-500/50" : "border-slate-700";
    const highlightClass = getHighlightClass(fieldId);

    if (fieldId === "inquiry_type" && options) {
      return (
        <div key={fieldId} className="space-y-1">
          <label className="text-xs text-slate-400">{label}</label>
          <select
            value={value as string}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            className={`${baseInputClass} ${errorClass} ${highlightClass}`}
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (fieldId === "message") {
      return (
        <div key={fieldId} className="space-y-1">
          <label className="text-xs text-slate-400">{label}</label>
          <textarea
            value={value as string}
            onChange={(e) => handleFieldChange(fieldId, e.target.value)}
            placeholder={`Enter your ${label.toLowerCase()}`}
            rows={3}
            className={`${baseInputClass} ${errorClass} ${highlightClass} resize-none`}
          />
          {meta.errors.length > 0 && (
            <p className="text-xs text-red-400">{meta.errors[0]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={fieldId} className="space-y-1">
        <label className="text-xs text-slate-400">{label}</label>
        <input
          type={fieldId === "email" ? "email" : "text"}
          value={value as string}
          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          className={`${baseInputClass} ${errorClass} ${highlightClass}`}
        />
        {meta.errors.length > 0 && (
          <p className="text-xs text-red-400">{meta.errors[0]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="gradient-border glow">
        {/* Window Chrome */}
        <div className="bg-slate-900 rounded-t-xl border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-xs text-slate-500 font-mono">
              https://playground.manifesto-ai.dev
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "form"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveTab("snapshot")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === "snapshot"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AI Snapshot
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 rounded-b-xl">
          <div className="grid md:grid-cols-2 min-h-[400px]">
            {/* Left: Form or Snapshot */}
            <div className="p-4 border-r border-slate-800">
              <AnimatePresence mode="wait">
                {activeTab === "form" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-white">Contact Form</h3>
                      <div className="flex items-center gap-2">
                        {formState?.isValid ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertCircle className="w-3 h-3" /> Incomplete
                          </span>
                        )}
                      </div>
                    </div>

                    {renderField("name")}
                    {renderField("email")}
                    {renderField("inquiry_type")}
                    {renderField("message")}

                    <button
                      disabled={!formState?.isValid}
                      className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Submit
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="snapshot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-medium text-white">
                        What AI Sees
                      </h3>
                    </div>
                    <pre className="text-xs text-slate-300 font-mono overflow-auto max-h-[340px] p-3 bg-slate-950 rounded-lg">
                      {snapshot
                        ? JSON.stringify(
                            {
                              topology: snapshot.topology,
                              state: {
                                form: snapshot.state.form,
                                fields: Object.fromEntries(
                                  Object.entries(snapshot.state.fields).map(
                                    ([k, v]) => [
                                      k,
                                      {
                                        value: v.value,
                                        dataType: v.dataType,
                                        valid: v.meta.valid,
                                        errors: v.meta.errors,
                                      },
                                    ]
                                  )
                                ),
                              },
                              interactions: snapshot.interactions.filter(
                                (i) => i.available
                              ),
                            },
                            null,
                            2
                          )
                        : "Loading..."}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: AI Chat */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 p-4 border-b border-slate-800">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">AI Assistant</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[280px]">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                        msg.role === "user"
                          ? "bg-emerald-500/20 text-emerald-100"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder='Try: "Fill all fields" or "Validate"'
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => session.dispatch({ type: "reset" })}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Fill all fields", "Validate", "Show status"].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setInputValue(cmd);
                      }}
                      className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
