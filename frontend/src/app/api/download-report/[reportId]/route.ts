import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { persistSession: false } },
);

function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice(6);
  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");
  return (
    username === (process.env.ADMIN_USERNAME || "admin") &&
    password === (process.env.ADMIN_PASSWORD || "password123")
  );
}

export async function GET(req: NextRequest, { params }: { params: { reportId: string } }) {
  if (!verifyAdmin(req)) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const reportId = Number(params.reportId);
  if (Number.isNaN(reportId)) {
    return NextResponse.json({ message: "Invalid report ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_reports")
    .select("report")
    .eq("id", reportId)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message || "Report not found" }, { status: 404 });
  }

  const content = `职业测评报告\n\n${data.report}`;
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="report_${reportId}.txt"`,
    },
  });
}
