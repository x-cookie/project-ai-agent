export interface Lesson {
  id: string;
  num: number;
  folder: string;
  title: string;
  tag: string;
  desc: string;
  keys: string[];
  stage: "fundamentals" | "agent-patterns" | "advanced-reasoning";
  icon: string;
}

export const LESSONS: Lesson[] = [
  { id: "01_intro",                    num: 1,  folder: "01_intro",                    title: "Introduction",     tag: "basic llm",           desc: "Load a local LLM and run your first prompt/response cycle.",                            keys: ["model loading","context window","inference","token generation"],             stage: "fundamentals",       icon: "ti-bolt" },
  { id: "02_openai-intro",             num: 2,  folder: "02_openai-intro",             title: "OpenAI intro",     tag: "hosted llms",         desc: "Call GPT-4, control temperature, and track token usage.",                               keys: ["api endpoints","temperature","token budgeting","vendor tradeoffs"],          stage: "fundamentals",       icon: "ti-brand-openai" },
  { id: "03_translation",              num: 3,  folder: "03_translation",              title: "Translation",      tag: "system prompts",      desc: "Specialize an agent with system prompts and enforce structured output formats.",          keys: ["system prompts","output format","role behavior","prompt engineering"],       stage: "fundamentals",       icon: "ti-language" },
  { id: "04_think",                    num: 4,  folder: "04_think",                    title: "Think",            tag: "reasoning",           desc: "Configure step-by-step reasoning and discover where pure LLM logic breaks down.",         keys: ["chain of thought","decomposition","reasoning limits","when tools help"],     stage: "fundamentals",       icon: "ti-brain" },
  { id: "05_batch",                    num: 5,  folder: "05_batch",                    title: "Batch",            tag: "parallelism",         desc: "Run multiple LLM calls concurrently using context sequences.",                           keys: ["parallel execution","context sequences","batch size","throughput"],          stage: "fundamentals",       icon: "ti-stack-2" },
  { id: "06_coding",                   num: 6,  folder: "06_coding",                   title: "Streaming",        tag: "response control",    desc: "Stream tokens in real time and enforce hard token budgets.",                             keys: ["streaming","real-time display","token limits","ux"],                         stage: "fundamentals",       icon: "ti-broadcast" },
  { id: "07_simple-agent",             num: 7,  folder: "07_simple-agent",             title: "Simple agent",     tag: "function calling",    desc: "Give the LLM tools it can call. Text generation becomes agency.",                        keys: ["function calling","tool definitions","json schema","decision loop"],         stage: "agent-patterns",     icon: "ti-tool" },
  { id: "08_simple-agent-with-memory", num: 8,  folder: "08_simple-agent-with-memory", title: "Memory agent",     tag: "persistent state",    desc: "Store facts across sessions so the agent remembers context over time.",                  keys: ["persistent memory","retrieval","state management","context augmentation"],   stage: "agent-patterns",     icon: "ti-database" },
  { id: "09_react-agent",              num: 9,  folder: "09_react-agent",              title: "ReAct agent",      tag: "reason + act",        desc: "Reason, act with a tool, observe the result. Repeat until solved.",                     keys: ["react pattern","iterative reasoning","observation loops","self-correction"],  stage: "agent-patterns",     icon: "ti-refresh" },
  { id: "10_aot-agent",                num: 10, folder: "10_aot-agent",                title: "AoT agent",        tag: "atomic planning",     desc: "Plan the full task as a dependency graph, then execute deterministically.",             keys: ["aot planning","atomic ops","dependency graph","dag execution"],              stage: "agent-patterns",     icon: "ti-circuit-diode" },
  { id: "11_error-handling",           num: 11, folder: "11_error-handling",           title: "Error handling",   tag: "resilience",          desc: "Typed errors, retry with backoff, graceful degradation, and correlation IDs.",          keys: ["error taxonomy","retry backoff","degradation","observability"],              stage: "advanced-reasoning", icon: "ti-shield-check" },
  { id: "12_tree-of-thought",          num: 12, folder: "12_tree-of-thought",          title: "Tree of thought",  tag: "beam search",         desc: "Generate multiple reasoning paths, score them, prune to the best branches.",           keys: ["tree of thought","beam search","branch pruning","objectives"],               stage: "advanced-reasoning", icon: "ti-git-branch" },
  { id: "13_graph-of-thought",         num: 13, folder: "13_graph-of-thought",         title: "Graph of thought", tag: "dag merge",            desc: "Extract from parallel sources, resolve conflicts, generate from a unified context.",   keys: ["graph of thought","dag","multi-source","conflict resolution"],               stage: "advanced-reasoning", icon: "ti-hierarchy-2" },
  { id: "14_chain-of-thought",         num: 14, folder: "14_chain-of-thought",         title: "Chain of thought", tag: "auditable reasoning", desc: "Sequential reasoning phases to prevent bias and produce full audit trails.",          keys: ["cot phases","reasoning traces","policy constraints","explainability"],       stage: "advanced-reasoning", icon: "ti-list-check" },
];

export const STAGES = [
  { key: "fundamentals",       label: "Fundamentals",       num: "01" },
  { key: "agent-patterns",     label: "Agent patterns",     num: "02" },
  { key: "advanced-reasoning", label: "Advanced reasoning", num: "03" },
] as const;

export const STAGE_GROUPS = {
  fundamentals:         LESSONS.filter(l => l.stage === "fundamentals"),
  "agent-patterns":     LESSONS.filter(l => l.stage === "agent-patterns"),
  "advanced-reasoning": LESSONS.filter(l => l.stage === "advanced-reasoning"),
} as const;

export function getLessonByFolder(folder: string): Lesson | undefined {
  return LESSONS.find(l => l.folder === folder);
}

export function getLessonIndex(folder: string): number {
  return LESSONS.findIndex(l => l.folder === folder);
}

const BASE = "https://raw.githubusercontent.com/pguso/ai-agents-from-scratch/main/examples";

export async function fetchLessonContent(folder: string) {
  const [concept, code] = await Promise.allSettled([
    fetch(`${BASE}/${folder}/CONCEPT.md`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.text() : ""),
    fetch(`${BASE}/${folder}/CODE.md`,    { next: { revalidate: 3600 } }).then(r => r.ok ? r.text() : ""),
  ]);
  return {
    concept: concept.status === "fulfilled" ? concept.value : "",
    code:    code.status    === "fulfilled" ? code.value    : "",
  };
}
