import { buildSystemPrompt } from "@/lib/tutor";
import type { Lesson } from "@/lib/lessons";

export async function POST(req: Request) {
  const { question, lesson, concept } = (await req.json()) as {
    question: string;
    lesson: Lesson;
    concept: string;
  };

  if (!question || !lesson) {
    return Response.json({ error: "Missing question or lesson" }, { status: 400 });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Agents from Scratch",
    },
    body: JSON.stringify({
      model: "mistralai/ministral-3b-2512",
      max_tokens: 1000,
      messages: [
        { role: "system", content: buildSystemPrompt(lesson, concept ?? "") },
        { role: "user",   content: question },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content ?? "Something went wrong.";

  return Response.json({ answer });
}
