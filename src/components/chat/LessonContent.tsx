"use client";

import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { Lesson } from "@/lib/lessons";

interface Props {
  lesson: Lesson;
  concept: string;
  code: string;
  prev: Lesson | null;
  next: Lesson | null;
}

const TABS = [
  { key: "concept", label: "Overview" },
  { key: "code",    label: "Code" },
] as const;

type Tab = "concept" | "code";

export function LessonContent({ lesson, concept, code, prev, next }: Props) {
  const [tab, setTab] = useState<Tab>("concept");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", padding: "0 26px", borderBottom: "0.5px solid var(--bd)", flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontSize: "12px",
              padding: "9px 10px",
              cursor: "pointer",
              color: tab === t.key ? "var(--t1)" : "var(--t3)",
              borderBottom: tab === t.key ? "1px solid var(--t1)" : "1px solid transparent",
              marginBottom: "-0.5px",
              background: "transparent",
              border: "none",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: tab === t.key ? "var(--t1)" : "transparent",
              letterSpacing: "0.01em",
              fontFamily: "var(--sans)",
              transition: "color 0.1s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
        {tab === "concept" && (
          <MarkdownRenderer>
            {concept || `## ${lesson.title}\n\n${lesson.desc}\n\nKey concepts: ${lesson.keys.join(", ")}`}
          </MarkdownRenderer>
        )}
        {tab === "code" && (
          <MarkdownRenderer>
            {code || `*No code file available for this lesson yet.*`}
          </MarkdownRenderer>
        )}

        {/* Prev / Next navigation */}
        <div style={{ display: "flex", gap: "7px", marginTop: "24px", paddingTop: "12px", borderTop: "0.5px solid var(--bd)" }}>
          {prev ? (
            <a href={`/learn/${prev.folder}`} style={{ fontSize: "11.5px", padding: "5px 12px", border: "0.5px solid var(--bd2)", borderRadius: "4px", background: "transparent", color: "var(--t2)", textDecoration: "none" }}>
              ← {prev.title}
            </a>
          ) : (
            <a href="/learn" style={{ fontSize: "11.5px", padding: "5px 12px", border: "0.5px solid var(--bd2)", borderRadius: "4px", background: "transparent", color: "var(--t2)", textDecoration: "none" }}>
              ← roadmap
            </a>
          )}
          {next && (
            <a href={`/learn/${next.folder}`} style={{ fontSize: "11.5px", padding: "5px 12px", border: "0.5px solid var(--acc)", borderRadius: "4px", background: "var(--acc)", color: "#000", textDecoration: "none" }}>
              {next.title} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
