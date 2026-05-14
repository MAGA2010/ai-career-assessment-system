# 上线部署检查清单

## 📋 开发阶段检查 ✓
- [ ] 后端代码测试通过
- [ ] 前端功能测试完毕
- [ ] AI API 集成测试
- [ ] 数据库持久化验证
- [ ] 错误处理完善
- [ ] 日志记录添加

## 🔒 安全检查
- [ ] 移除硬编码的 API 密钥
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 管理接口已添加认证（✓ 已完成）
- [ ] CORS 配置正确（当前允许所有源）
- [ ] 敏感信息不在日志中
- [ ] SQL 注入防护（SQLAlchemy ORM 自动防护）

## 🗂️ 配置检查
- [ ] `.env.example` 已创建（✓ 已完成）
- [ ] README 包含完整部署指南（✓ 已完成）
- [ ] AI_CONFIG_GUIDE.md 已创建（✓ 已完成）
- [ ] 所有环境变量在 `.env` 中定义
- [ ] 数据库连接字符串正确

## 📦 代码打包
- [ ] Git 仓库已初始化
- [ ] `.gitignore` 配置正确
- [ ] 代码已上传到 GitHub
- [ ] 版本标签已创建
- [ ] CHANGELOG.md 已添加

## 🚀 后端部署 (Supabase/PostgreSQL + Vercel)
- [ ] 创建云账户（Supabase）
- [ ] 连接 GitHub 仓库
- [ ] 设置环境变量：
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] OPENAI_API_KEY
  - [ ] OPENAI_BASE_URL
  - [ ] AI_MODEL
  - [ ] ADMIN_USERNAME
  - [ ] ADMIN_PASSWORD
- [ ] 自动部署启用
- [ ] 健康检查配置：`GET /api/questions` 应返回 200

## 🎨 前端部署 (Vercel)
- [ ] 注册 Vercel 账户
- [ ] 连接 GitHub（frontend 文件夹）
- [ ] 设置环境变量：
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] OPENAI_API_KEY
  - [ ] OPENAI_BASE_URL
  - [ ] AI_MODEL
  - [ ] ADMIN_USERNAME
  - [ ] ADMIN_PASSWORD
- [ ] 自动部署启用
- [ ] 自定义域名配置（可选）

## ✅ 部署后测试
- [ ] 前端首页能正常加载
- [ ] 后端 `/api/questions` 返回问题列表
- [ ] 提交测评，查看是否返回报告
- [ ] 下载报告功能正常
- [ ] 管理接口 `/api/admin/stats` 需要认证

## 📊 性能检查
- [ ] 页面加载时间 < 3 秒
- [ ] API 响应时间 < 5 秒
- [ ] 数据库查询优化
- [ ] 前端代码分割优化

## 📈 监控和日志
- [ ] 配置应用日志收集
- [ ] 设置错误告警
- [ ] 配置性能监控
- [ ] 定期检查日志

## 🔄 更新和维护
- [ ] 制定更新计划
- [ ] 备份数据库
- [ ] 定期安全更新
- [ ] 用户反馈渠道

## 🎯 上线前最终检查
- [ ] 管理员账户已修改（当前：admin/password123）
- [ ] 生产数据库已备份
- [ ] 灾备方案已制定
- [ ] 用户文档已准备
- [ ] 支持流程已建立

## 📞 部署后支持
- [ ] 监控应用日志
- [ ] 快速响应错误
- [ ] 收集用户反馈
- [ ] 定期更新改进

---

## 🚀 快速部署命令

### Vercel 部署
```bash
# 1. 上传到 GitHub
git push origin main

# 2. Vercel 连接 GitHub 并自动部署
# 3. 在 Vercel 设置环境变量
# 4. 查看部署日志
```

### 本地验证
```bash
# 后端
cd /path/to/project
.\.venv\Scripts\Activate.ps1
python -m uvicorn app:app --host 0.0.0.0 --port 8000

# 前端
cd frontend
npm run dev  # http://localhost:3000

# 测试
curl http://localhost:8000/api/questions
```

## ⚠️ 常见问题

### API 503 错误
- 检查 OPENAI_BASE_URL 是否正确
- 验证网关可访问性
- 检查 API Key 有效期

### 前端连接不到后端
- 检查 Vercel 部署是否成功
- 验证 `/api/questions` 是否可访问
- 确认 Vercel 环境变量是否已经设置

### 数据库连接失败
- 检查 DATABASE_URL 格式
- 验证数据库凭据
- 检查网络连接

---

最后更新：2026-05-12
