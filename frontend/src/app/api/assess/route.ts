import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const QUESTIONS = [
  { id: 1, text: "你更喜欢独立工作还是团队合作？", options: ["独立工作", "团队合作", "两者都喜欢"] },
  { id: 2, text: "你对技术感兴趣吗？", options: ["非常感兴趣", "有点兴趣", "不感兴趣"] },
  { id: 3, text: "你喜欢创造性工作吗？", options: ["喜欢", "不喜欢", "视情况而定"] },
];

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: { persistSession: false },
});

function normalizeBaseUrl(rawUrl: string) {
  return rawUrl.replace(/\/$/, "");
}

function buildPrompt(answers: Record<number, string>) {
  const answersText = Object.entries(answers)
    .map(([qid, ans]) => {
      const question = QUESTIONS.find((item) => item.id === Number(qid));
      return `问题${qid}: ${question?.text ?? "未知问题"}\n回答: ${ans}`;
    })
    .join("\n");

  return `基于以下用户对职业测评问题的回答，生成一份职业测评报告。报告应包括：\n1. 用户的性格倾向分析\n2. 适合的职业类型\n3. 职业发展建议\n\n此外，根据用户的回答，生成2-3个自适应后续问题，每个问题包含问题文本和选项列表。\n\n请以JSON格式回复，格式如下：\n{\n  "report": "详细报告文本",\n  "career_suggestions": ["职业1", "职业2", "职业3"],\n  "follow_up_questions": [\n    {"id": 4, "text": "问题文本", "options": ["选项1", "选项2", "选项3"]},\n    {"id": 5, "text": "问题文本", "options": ["选项1", "选项2", "选项3"]}\n  ]\n}\n\n用户回答：\n${answersText}\n\n请用中文回复。`;
}

async function callOpenAI(prompt: string) {
  if (!OPENAI_BASE_URL || !OPENAI_API_KEY) {
    throw new Error("OPENAI_BASE_URL 或 OPENAI_API_KEY 未配置。");
  }

  const url = `${normalizeBaseUrl(OPENAI_BASE_URL)}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  const choice = data?.choices?.[0] || {};
  return choice.message?.content ?? choice.text ?? JSON.stringify(data);
}

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 未配置。" }, { status: 500 });
    }

    const body = await req.json();
    const answers = body.answers as Record<number, string>;

    const prompt = buildPrompt(answers);
    const rawText = await callOpenAI(prompt);

    let parsed: {
      report?: string;
      career_suggestions?: string[];
      follow_up_questions?: Array<{ id: number; text: string; options: string[] }>;
    } = {};

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // ignore JSON parse error
    }

    const report = parsed.report || rawText || "AI 未返回有效报告。";
    const career_suggestions = parsed.career_suggestions || ["软件工程师", "设计师", "教师"];
    const follow_up_questions = parsed.follow_up_questions || [];

    const { error } = await supabase.from("user_reports").insert([
      {
        answers,
        report,
        career_suggestions,
        follow_up_questions,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
    }

    return NextResponse.json({ report, career_suggestions, follow_up_questions });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json(
      {
        report: `AI调用失败：${error instanceof Error ? error.message : "未知错误"}。`,
        career_suggestions: ["软件工程师", "设计师", "教师"],
        follow_up_questions: [],
      },
      { status: 500 },
    );
  }
}
