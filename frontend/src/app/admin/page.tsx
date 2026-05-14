"use client";

import { useState, useEffect } from "react";
import { AdminStats, UserReport } from "@/types";

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, []);

  const getBasicAuthHeader = () => {
    const username = window.prompt("请输入管理员用户名", "admin");
    const password = window.prompt("请输入管理员密码", "");
    if (!username || !password) return null;
    return `Basic ${window.btoa(`${username}:${password}`)}`;
  };

  const fetchStats = async () => {
    try {
      const authHeader = getBasicAuthHeader();
      if (!authHeader) return;
      const res = await fetch("/api/admin/stats", { headers: { Authorization: authHeader } });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const authHeader = getBasicAuthHeader();
      if (!authHeader) {
        setLoading(false);
        return;
      }
      const res = await fetch("/api/admin/reports", { headers: { Authorization: authHeader } });
      const data = await res.json();
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: number) => {
    const authHeader = getBasicAuthHeader();
    if (!authHeader) return;

    try {
      const res = await fetch(`/api/download-report/${reportId}`, {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) {
        throw new Error("下载失败");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.txt`;
      a.click();
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">管理后台</h1>

        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">统计数据</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
                <div className="text-gray-600">总用户数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.total_reports}</div>
                <div className="text-gray-600">总报告数</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">用户报告</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">报告 ID: {report.id}</span>
                  <span className="text-sm text-gray-500">{report.created_at}</span>
                </div>
                <div className="mb-2">
                  <strong>答案:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(report.answers, null, 2)}
                  </pre>
                </div>
                <div className="mb-4">
                  <strong>报告:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                    {report.report}
                  </pre>
                </div>
                <button
                  onClick={() => handleDownload(report.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  下载报告
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}