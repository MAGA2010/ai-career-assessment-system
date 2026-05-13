from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field

class InferenceRequest(BaseModel):
    provider: str = Field(..., description="AI 提供商，例如 openai 或 azure")
    model: str = Field(..., description="要调用的模型名称")
    prompt: str = Field(..., description="用户输入的提示")
    params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="可选模型参数，如 temperature、max_tokens")

class InferenceResponse(BaseModel):
    provider: str
    model: str
    raw: Dict[str, Any]

# 职业测评相关
class Question(BaseModel):
    id: int
    text: str
    options: List[str]

class AssessmentRequest(BaseModel):
    answers: Dict[int, str]  # question_id: selected_option

class AssessmentResponse(BaseModel):
    report: str
    career_suggestions: List[str]
    follow_up_questions: List[Question] = []  # 新增：后续自适应问题

class UserReport(BaseModel):
    id: int
    answers: Dict[int, str]
    report: str
    created_at: str

class AdminStats(BaseModel):
    total_users: int
    total_reports: int
