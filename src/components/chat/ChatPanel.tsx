"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import type { Lesson } from "@/lib/lessons";

interface Msg {
  role: "user" | "ai" | "thinking";
  text: string;
}

const QUICK_QUESTIONS = [
  "Why does this pattern matter?",
  "How does this connect to the next lesson?",
  "Where would I use this in production?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "10px 12px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--t3)", display: "inline-block", animation: `typing-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
    </div>
  );
}

interface Props { lesson: Lesson; concept: string; }

export function ChatPanel({ lesson, concept }: Props) {
  const [msgs,      setMsgs]      = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [width,     setWidth]     = useState(280);

  const msgsRef    = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX     = useRef(0);
  const startW     = useRef(0);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  /* ── resize ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startW.current = width;
    const move = (ev: PointerEvent) => {
      if (!isResizing.current) return;
      setWidth(Math.max(220, Math.min(520, startW.current + (startX.current - ev.clientX))));
    };
    const up = () => { isResizing.current = false; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }, [width]);

  /* ── streaming ask ── */
  async function ask(question?: string) {
    const q = question ?? input.trim();
    if (!q || loading) return;
    setInput("");
    setShowQuick(false);

    /* Start with user msg + thinking dots */
    setMsgs(prev => [...prev, { role: "user", text: q }, { role: "thinking", text: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lesson, concept }),
      });

      if (!res.body) throw new Error("No body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";
      let   started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const json  = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (!delta) continue;

            if (!started) {
              /* Replace thinking bubble with first token */
              started = true;
              setMsgs(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "ai", text: delta };
                return copy;
              });
            } else {
              /* Append subsequent tokens */
              setMsgs(prev => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = { ...last, text: last.text + delta };
                return copy;
              });
            }
          } catch { /* ignore parse errors on incomplete chunks */ }
        }
      }

      /* If stream ended with no content */
      if (!started) {
        setMsgs(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "ai", text: "No response received." };
          return copy;
        });
      }
    } catch {
      setMsgs(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "ai", text: "Connection error — try again." };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  const isLastStreaming = loading && msgs.length > 0 && msgs[msgs.length - 1].role === "ai";

  return (
    <aside style={{ width: `${width}px`, minWidth: `${width}px`, borderLeft: "0.5px solid var(--bd)", display: "flex", flexDirection: "column", background: "var(--bg2)", position: "relative", flexShrink: 0 }}>

      {/* Drag handle */}
      <div onPointerDown={onPointerDown} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", cursor: "col-resize", zIndex: 10 }}>
        <div style={{ position: "absolute", left: "1px", top: "50%", transform: "translateY(-50%)", width: "2px", height: "32px", borderRadius: "1px", background: "var(--bd3)", opacity: 0.5 }} />
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 14px 10px 16px", borderBottom: "0.5px solid var(--bd)", flexShrink: 0 }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: loading ? "var(--purple)" : "var(--green)", flexShrink: 0, transition: "background 0.3s" }} />
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--t1)" }}>AI tutor</span>
        <span style={{ fontSize: "10px", color: "var(--t3)", fontFamily: "var(--mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {lesson.title.toLowerCase()}
        </span>
        <span style={{ fontSize: "9px", color: "var(--t4)", fontFamily: "var(--mono)", flexShrink: 0, border: "0.5px solid var(--bd2)", borderRadius: "2px", padding: "1px 4px" }}>
          mistral
        </span>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px", minHeight: 0 }}>
        {msgs.length === 0 && (
          <div style={{ fontSize: "11px", color: "var(--t4)", fontFamily: "var(--mono)", textAlign: "center", marginTop: "24px", lineHeight: 1.7 }}>
            Ask anything about<br />{lesson.title}
          </div>
        )}

        {msgs.map((m, i) => {
          const isCurrentlyStreaming = isLastStreaming && i === msgs.length - 1;
          return (
            <div key={i} style={{ maxWidth: "96%", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "thinking" ? (
                <TypingDots />
              ) : m.role === "user" ? (
                <div style={{ fontSize: "12px", lineHeight: 1.55, padding: "7px 10px", borderRadius: "6px 6px 2px 6px", background: "#1e1a4a", color: "#aba6f0", border: "0.5px solid #3d3680" }}>
                  {m.text}
                </div>
              ) : (
                <div
                  className={`chat-md${isCurrentlyStreaming ? " streaming" : ""}`}
                  style={{ fontSize: "12px", lineHeight: 1.65, padding: "9px 11px", borderRadius: "2px 6px 6px 6px", background: "var(--bg3)", border: "0.5px solid var(--bd2)", color: "var(--t2)" }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {m.text || " "}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick questions */}
      {showQuick && (
        <div style={{ padding: "0 10px 6px", display: "flex", flexDirection: "column", gap: "3px", flexShrink: 0 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => ask(q)} style={{ fontSize: "10.5px", padding: "5px 9px", borderWidth: "0.5px", borderStyle: "solid", borderColor: "var(--bd2)", borderRadius: "3px", background: "transparent", color: "var(--t3)", cursor: "pointer", textAlign: "left", lineHeight: 1.4, fontFamily: "var(--mono)" }}>
              ↗ {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: "6px", padding: "8px 10px", borderTop: "0.5px solid var(--bd)", flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder={loading ? "Generating…" : "Ask anything…"}
          disabled={loading}
          style={{ flex: 1, fontSize: "11.5px", padding: "6px 9px", borderRadius: "4px", borderWidth: "0.5px", borderStyle: "solid", borderColor: "var(--bd2)", background: "var(--bg)", color: "var(--t1)", outline: "none", fontFamily: "var(--sans)", opacity: loading ? 0.6 : 1 }}
        />
        <button onClick={() => ask()} disabled={loading} style={{ width: "28px", height: "28px", borderRadius: "4px", background: loading ? "var(--bg3)" : "var(--acc)", borderWidth: 0, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
          <i className={`ti ${loading ? "ti-loader-2" : "ti-send"}`} style={{ fontSize: "12px", color: loading ? "var(--t3)" : "#000", animation: loading ? "spin 1s linear infinite" : "none" }} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
