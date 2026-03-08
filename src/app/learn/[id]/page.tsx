import { notFound } from "next/navigation";
import { TopNav } from "@/components/shared/TopNav";
import { LESSONS, STAGES, getLessonByFolder, getLessonIndex, fetchLessonContent } from "@/lib/lessons";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { LessonContent } from "@/components/chat/LessonContent";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return LESSONS.map(l => ({ id: l.folder }));
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;
  const lesson = getLessonByFolder(id);
  if (!lesson) notFound();

  const idx = getLessonIndex(id);
  const prev = idx > 0 ? LESSONS[idx - 1] : null;
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

  const { concept, code } = await fetchLessonContent(lesson.folder);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <TopNav
        crumb={
          <>
            <span style={{ color: "var(--t3)" }}>docs</span>
            <span style={{ color: "var(--t4)", margin: "0 4px" }}>/</span>
            <span style={{ color: "var(--t2)" }}>{lesson.title.toLowerCase()}</span>
          </>
        }
        backHref="/learn"
        backLabel="roadmap"
        progress={idx + 1}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <aside style={{ width: "200px", minWidth: "200px", borderRight: "0.5px solid var(--bd)", overflowY: "auto", background: "var(--bg)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {STAGES.map(stage => {
            const stageLessons = LESSONS.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} style={{ padding: "10px 0" }}>
                <div style={{ fontSize: "9px", color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 14px 6px", fontFamily: "var(--mono)" }}>
                  {stage.label}
                </div>
                {stageLessons.map(l => {
                  const isActive = l.id === lesson.id;
                  return (
                    <a
                      key={l.id}
                      href={`/learn/${l.folder}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "5px 14px",
                        borderLeft: isActive ? "1.5px solid var(--purple)" : "1.5px solid transparent",
                        background: isActive ? "var(--bg2)" : "transparent",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: isActive ? "var(--purple)" : "var(--t3)", fontFamily: "var(--mono)", minWidth: "16px" }}>
                        {String(l.num).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: "12px", color: isActive ? "var(--t1)" : "var(--t2)" }}>
                        {l.title}
                      </span>
                    </a>
                  );
                })}
              </div>
            );
          })}
        </aside>

        {/* Main lesson area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Lesson hero */}
          <div style={{ padding: "20px 26px 16px", borderBottom: "0.5px solid var(--bd)", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", color: "var(--t3)", fontFamily: "var(--mono)", marginBottom: "6px" }}>
              Lesson {lesson.num} of {LESSONS.length} · {lesson.tag}
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: 500, color: "var(--t1)", letterSpacing: "-0.02em" }}>
              {lesson.title}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--t2)", marginTop: "5px", lineHeight: 1.65, maxWidth: "440px" }}>
              {lesson.desc}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
              {lesson.keys.map(k => (
                <span key={k} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "2px", background: "var(--bg3)", color: "var(--t3)", border: "0.5px solid var(--bd2)", fontFamily: "var(--mono)" }}>
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Tabbed content — client component renders markdown */}
          <LessonContent lesson={lesson} concept={concept} code={code} prev={prev} next={next} />
        </div>

        {/* AI Tutor panel */}
        <ChatPanel lesson={lesson} concept={concept} />
      </div>
    </div>
  );
}
