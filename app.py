import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from providers import call_provider
from schemas import InferenceRequest, InferenceResponse, Question, AssessmentRequest, AssessmentResponse, UserReport as UserReportSchema, AdminStats
from models import Base, UserReport
from typing import List
import json
import secrets

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./career_assessment.db")
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Career Assessment",
    description="AI驱动的职业测评系统",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

# 简单认证凭据（生产环境使用环境变量）
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password123")

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# 基础题目（简化版）
QUESTIONS = [
    {"id": 1, "text": "你更喜欢独立工作还是团队合作？", "options": ["独立工作", "团队合作", "两者都喜欢"]},
    {"id": 2, "text": "你对技术感兴趣吗？", "options": ["非常感兴趣", "有点兴趣", "不感兴趣"]},
    {"id": 3, "text": "你喜欢创造性工作吗？", "options": ["喜欢", "不喜欢", "视情况而定"]},
]

@app.get("/")
async def root():
    return {"message": "AI Career Assessment is running"}

@app.get("/api/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables"""
    import os
    return {
        "OPENAI_API_KEY_SET": bool(os.getenv("OPENAI_API_KEY")),
        "OPENAI_BASE_URL": os.getenv("OPENAI_BASE_URL"),
        "AI_PROVIDER": os.getenv("AI_PROVIDER"),
        "AI_MODEL": os.getenv("AI_MODEL"),
    }

@app.get("/api/debug/test-openai")
async def debug_test_openai():
    """Debug endpoint to test OpenAI API call"""
    from providers import call_openai
    result = await call_openai("gpt-4o-mini", "说一个职业", {"temperature": 0.7, "max_tokens": 100})
    return result

@app.get("/api/questions", response_model=List[Question])
async def get_questions():
    return [Question(**q) for q in QUESTIONS]

@app.post("/api/assess", response_model=AssessmentResponse)
async def assess_career(request: AssessmentRequest):
    # 构建prompt
    answers_text = "\n".join([f"问题{str(qid)}: {QUESTIONS[qid-1]['text']}\n回答: {ans}" for qid, ans in request.answers.items()])
    prompt = f"""
基于以下用户对职业测评问题的回答，生成一份职业测评报告。报告应包括：
1. 用户的性格倾向分析
2. 适合的职业类型
3. 职业发展建议

此外，根据用户的回答，生成2-3个自适应后续问题，每个问题包含问题文本和选项列表。

请以JSON格式回复，格式如下：
{{
  "report": "详细报告文本",
  "career_suggestions": ["职业1", "职业2", "职业3"],
  "follow_up_questions": [
    {{"id": 4, "text": "问题文本", "options": ["选项1", "选项2", "选项3"]}},
    {{"id": 5, "text": "问题文本", "options": ["选项1", "选项2", "选项3"]}}
  ]
}}

用户回答：
{answers_text}

请用中文回复。
"""

    try:
        raw = await call_provider(
            provider=AI_PROVIDER,
            model=AI_MODEL,
            prompt=prompt,
            params={"temperature": 0.7, "max_tokens": 1500},
        )
        response_text = raw.get("text", "AI response failed.")

        # 尝试解析JSON响应
        try:
            parsed = json.loads(response_text)
            report = parsed.get("report", "无法生成报告，请检查AI配置。")
            career_suggestions = parsed.get("career_suggestions", ["软件工程师", "设计师", "教师"])
            follow_up_questions = [Question(**q) for q in parsed.get("follow_up_questions", [])]
        except (json.JSONDecodeError, KeyError):
            # 如果解析失败，使用默认值
            report = response_text if "API key not configured" not in response_text else "AI API未配置，请检查OPENAI_API_KEY和OPENAI_BASE_URL。"
            career_suggestions = ["软件工程师", "设计师", "教师", "销售代表"]
            follow_up_questions = []

        # 存储到数据库
        db = SessionLocal()
        db_report = UserReport(answers=request.answers, report=report)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        db.close()

        return AssessmentResponse(report=report, career_suggestions=career_suggestions, follow_up_questions=follow_up_questions)
    except Exception as exc:
        # 异常处理，返回默认响应
        return AssessmentResponse(
            report=f"AI调用失败：{str(exc)}。请检查API配置。",
            career_suggestions=["软件工程师", "设计师", "教师"],
            follow_up_questions=[]
        )

@app.get("/api/admin/stats", response_model=AdminStats)
async def get_admin_stats(username: str = Depends(verify_admin)):
    db = SessionLocal()
    total_reports = db.query(UserReport).count()
    total_users = total_reports  # 简化，假设每个报告是一个用户
    db.close()
    return AdminStats(total_users=total_users, total_reports=total_reports)

@app.get("/api/admin/reports", response_model=List[UserReportSchema])
async def get_admin_reports():
    db = SessionLocal()
    reports = db.query(UserReport).all()
    db.close()
    return [UserReportSchema(id=r.id, answers=r.answers, report=r.report, created_at=r.created_at.isoformat()) for r in reports]

@app.get("/api/download-report/{report_id}")
async def download_report(report_id: int):
    db = SessionLocal()
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    db.close()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # 生成简单PDF或文本文件（这里用文本）
    content = f"职业测评报告\n\n{report.report}"
    with open(f"report_{report_id}.txt", "w", encoding="utf-8") as f:
        f.write(content)
    return FileResponse(f"report_{report_id}.txt", media_type='application/octet-stream', filename=f"report_{report_id}.txt")

@app.post("/api/v1/infer", response_model=InferenceResponse)
async def infer(request: InferenceRequest):
    try:
        raw = await call_provider(
            provider=request.provider,
            model=request.model,
            prompt=request.prompt,
            params=request.params or {},
        )
        return InferenceResponse(provider=request.provider, model=request.model, raw=raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
