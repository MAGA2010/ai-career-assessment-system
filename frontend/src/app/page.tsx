"use client";

import { useState, useEffect } from "react";
import { Question, AssessmentRequest, AssessmentResponse } from "@/types";

export default function Home() {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [phase, setPhase] = useState<'initial' | 'follow_up' | 'complete'>('initial');
  const [error, setError] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setError(null);
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error("无法获取问题列表");
      const data = await res.json();
      setCurrentQuestions(data);
    } catch (err) {
      setError("获取问题失败，请检查后端服务是否启动");
      console.error("Failed to fetch questions:", err);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== currentQuestions.length) {
      setError("请回答所有问题");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 合并所有答案
      const mergedAnswers = { ...allAnswers, ...answers };
      
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: mergedAnswers }),
      });
      
      if (!res.ok) throw new Error("API 请求失败");
      
      const data: AssessmentResponse = await res.json();
      setResult(data);

      if (phase === 'initial' && data.follow_up_questions && data.follow_up_questions.length > 0) {
        // 保存初始答案，显示后续问题
        setAllAnswers(mergedAnswers);
        setCurrentQuestions(data.follow_up_questions);
        setAnswers({});
        setPhase('follow_up');
      } else {
        // 最终结果
        setPhase('complete');
      }
    } catch (err) {
      setError(`提交失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error("Failed to submit assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `AI 职业测评报告\n\n${result.report}\n\n职业建议：\n${result.career_suggestions.map(s => `- ${s}`).join('\n')}`;
    const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career_report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const handleRestart = () => {
    setPhase('initial');
    setResult(null);
    setAnswers({});
    setAllAnswers({});
    setError(null);
    fetchQuestions();
  };

  // 显示最终报告
  if (phase === 'complete' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">✨ 职业测评结果</h1>
            <p className="text-gray-600">基于您的回答为您生成的个性化职业建议</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">📋 测评报告</h2>
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.report}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">💼 职业建议</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.career_suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold text-gray-900">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-6 border-t">
              <button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                📥 下载报告
              </button>
              <button
                onClick={handleRestart}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                🔄 重新测评
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示问题表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 AI 职业测评系统</h1>
          <p className="text-gray-600">
            {phase === 'initial' ? '基础题目' : '自适应后续问题'}
            {' - '} 
            第 {answers ? Object.keys(answers).length : 0} / {currentQuestions.length} 题
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-6">
          {currentQuestions.map((question, idx) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h2>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                        style={{
                          borderColor: answers[question.id] === option ? '#3b82f6' : '#e5e7eb',
                          backgroundColor: answers[question.id] === option ? '#f0f9ff' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="w-4 h-4 text-blue-500 cursor-pointer"
                        />
                        <span className="ml-3 text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 pt-6 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length !== currentQuestions.length}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition ${
              loading || Object.keys(answers).length !== currentQuestions.length
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            }`}
          >
            {loading ? '⏳ 分析中...' : phase === 'follow_up' ? '✅ 完成测评' : '📤 提交测评'}
          </button>
        </div>
      </div>
    </div>
  );
}
