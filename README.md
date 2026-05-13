# 🎯 AI 职业测评系统

基于 FastAPI 和 OpenAI 的智能职业测评平台。提供自适应问题、AI 生成报告和职业建议。

## ✨ 核心特性

- 🤖 **AI 驱动**：基于用户回答生成个性化职业评估报告
- 🧠 **自适应问答**：根据初始答案动态生成后续问题
- 💼 **职业建议**：AI 推荐适合用户的职业方向
- 📊 **数据持久化**：保存用户测评历史
- 🔒 **管理后台**：受保护的统计接口

## 🚀 快速开始

### 前置条件
- Python 3.11+
- Node.js 18+
- OpenAI 兼容 API 密钥

### 本地开发

#### 1. 克隆项目
```bash
cd "d:\职业选择\New project"
```

#### 2. 配置后端
```powershell
# 创建虚拟环境
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 复制环境变量模板
copy .env.example .env
```

编辑 `.env`，填写你的 API 密钥：
```
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://yyds.215.im/v1
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
DATABASE_URL=sqlite:///./career_assessment.db
```

#### 3. 启动后端
```powershell
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

访问：http://localhost:8000

#### 4. 配置和启动前端
```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:3000

## 📁 项目结构

```
.
├── app.py                      # FastAPI 主应用
├── providers.py                # AI 提供商适配层
├── models.py                   # SQLAlchemy 数据模型
├── schemas.py                  # Pydantic 数据结构
├── requirements.txt            # Python 依赖
├── .env.example               # 环境变量模板
├── AI_CONFIG_GUIDE.md         # AI 配置指南
├── DEPLOYMENT_CHECKLIST.md    # 部署检查清单
├── frontend/                  # Next.js 前端应用
│   ├── src/app/page.tsx      # 主页面（已改进UI）
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔌 API 端点

### 公开接口
- `GET /` - 健康检查
- `GET /api/questions` - 获取初始问题列表
- `POST /api/assess` - 提交答案，获取报告和后续问题

### 调试接口
- `GET /api/debug/env` - 查看环境变量
- `GET /api/debug/test-openai` - 测试 AI 连接

### 管理接口（需认证）
- `GET /api/admin/stats` - 获取统计信息 (Basic Auth: admin/password123)

## 🔄 工作流程

1. **初始问卷**：3 个基础问题
2. **AI 分析**：生成报告和职业建议
3. **自适应问题**：AI 生成 2-3 个后续问题
4. **最终报告**：展示完整评估结果
5. **数据保存**：所有答案和报告持久化

## 🌐 部署到 Render

1. **推送到 GitHub**
```bash
git push origin main
```

2. **Render 配置**
   - 登录 https://render.com 并创建一个新的 Web Service
   - 连接你的 GitHub 仓库
   - 设置 `Root Directory` 为项目根目录（默认即可）
   - `Build Command`：`pip install -r requirements.txt`
   - `Start Command`：`bash start.sh`
   - 添加环境变量：
     - `OPENAI_API_KEY`
     - `OPENAI_BASE_URL`
     - `AI_PROVIDER=openai`
     - `AI_MODEL=gpt-4o-mini`
     - `DATABASE_URL`
     - `ADMIN_USERNAME`（可选）
     - `ADMIN_PASSWORD`（可选）

3. **前端部署**
   - 前端仍建议部署到 Vercel 或其他前端平台
   - 添加环境变量：`NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com`

4. **验证后端**
   - `GET /api/questions` 应返回问题列表
   - `GET /api/debug/env` 用于检查环境变量是否加载正常

详见 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🌐 部署到 Railway

1. **推送到 GitHub**
```bash
git push origin main
```

2. **Railway 配置**
   - 新建项目，连接 GitHub
   - 添加环境变量：
     - `OPENAI_API_KEY`
     - `OPENAI_BASE_URL`
     - `DATABASE_URL` (PostgreSQL)
     - `AI_PROVIDER=openai`
     - `AI_MODEL=gpt-4o-mini`
   - 启动命令：`python -m uvicorn app:app --host 0.0.0.0 --port $PORT`

3. **Vercel 前端部署**
   - 连接 frontend 文件夹
   - 添加：`NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app`

详见 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## 🔧 快速切换 AI 服务

无需改代码，只需修改 `.env`：

### OpenAI 官方
```
OPENAI_API_KEY=sk-proj-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 自定义网关
```
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://yyds.215.im/v1
```

详见 [AI_CONFIG_GUIDE.md](./AI_CONFIG_GUIDE.md)

## 🐛 故障排除

### 前端连接不到后端
- 检查后端是否启动：`http://localhost:8000`
- 检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL`

### API 503 错误
- 检查 `OPENAI_BASE_URL` 是否正确
- 验证 API Key 有效性

### 完整调试
```bash
# 查看环境配置
curl http://localhost:8000/api/debug/env

# 测试 AI 连接
curl http://localhost:8000/api/debug/test-openai
```

## 📝 文档

- [AI 配置指南](./AI_CONFIG_GUIDE.md) - 快速切换 AI 服务
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 完整部署指南

## 🔐 安全

- ✅ 管理接口已添加基础认证
- ⚠️ 生产环境修改管理员密码
- ✅ 所有敏感信息通过 .env 配置
- ✅ 使用 HTTPS（由部署平台提供）

## 💡 特点

- **配置灵活**：只需改 API key 和 URL，无需修改代码
- **自适应**：AI 根据答案生成个性化问题
- **完整集成**：前后端、数据库、AI 一体化
- **易于部署**：支持 Railway、Render、Vercel
- **用户友好**：改进的 UI/UX 设计

---

**最后更新**：2026-05-12  
**版本**：1.0.0  
**状态**：生产就绪 ✅

