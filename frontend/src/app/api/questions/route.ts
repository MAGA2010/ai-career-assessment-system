import { NextResponse } from "next/server";

const QUESTIONS = [
  { id: 1, text: "你更喜欢独立工作还是团队合作？", options: ["独立工作", "团队合作", "两者都喜欢"] },
  { id: 2, text: "你对技术感兴趣吗？", options: ["非常感兴趣", "有点兴趣", "不感兴趣"] },
  { id: 3, text: "你喜欢创造性工作吗？", options: ["喜欢", "不喜欢", "视情况而定"] },
];

export async function GET() {
  return NextResponse.json(QUESTIONS);
}
