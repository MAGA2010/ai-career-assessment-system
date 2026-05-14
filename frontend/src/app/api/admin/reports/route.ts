import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  if (!verifyAdmin(req)) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { data, error } = await supabase
    .from("user_reports")
    .select("id, answers, report, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
