from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, index=True)
    answers = Column(JSON)  # 存储用户答案
    report = Column(Text)   # AI生成的报告
    created_at = Column(DateTime, default=datetime.utcnow)