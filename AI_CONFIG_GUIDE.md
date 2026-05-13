# AI 配置指南

## 快速切换 AI 服务

本系统设计支持快速切换不同的 AI 服务，**无需修改代码**。只需要更新环境变量即可。

### 当前配置
```
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://xxx/v1
```

### 支持的 AI 服务

#### 1. OpenAI 兼容网关
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://your-gateway.com/v1
AI_MODEL=gpt-4o-mini  # 或其他 OpenAI 模型
```

**适用于：**
- OpenAI 官方 API
- 第三方 OpenAI 兼容网关（如 yyds.215.im）
- 私有 LLM 服务（Ollama、vLLM 等）

#### 2. Azure OpenAI
```
AI_PROVIDER=azure
AZURE_OPENAI_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=deployment-name
AI_MODEL=gpt-4  # Azure 中的部署名
```

#### 3. Google Gemini (可选)
```
AI_PROVIDER=gemini
GEMINI_API_KEY=xxx
AI_MODEL=gemini-1.5-flash
```

### 部署步骤

#### 本地测试
1. 创建 `.env` 文件
2. 复制上面的配置，填入你的 API 密钥
3. 运行后端：`python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000`

#### Railway 部署
1. 在 Railway 项目设置中，添加环境变量
2. 设置：
   - `OPENAI_API_KEY`: 你的 API 密钥
   - `OPENAI_BASE_URL`: 你的网关地址
   - `AI_PROVIDER`: openai
   - `AI_MODEL`: gpt-4o-mini

#### Render 部署
1. 在 Render 创建 Web Service
2. 连接 GitHub 仓库
3. 添加环境变量（同上）

### 故障排除

**API 返回 503 错误**
- 检查网关 URL 是否正确
- 验证 API Key 是否有效
- 尝试直接访问 `https://your-gateway/v1/models`

**API 返回 401/403 错误**
- 检查 API Key 是否正确
- 验证 API Key 是否过期
- 确保 API Key 有相应权限

**模型不支持**
- 检查 AI_MODEL 是否存在于该提供商
- 查看提供商的模型列表

### 调试

访问以下端点检查配置：
- `http://localhost:8000/api/debug/env` - 查看当前环境变量
- `http://localhost:8000/api/debug/test-openai` - 测试 AI 连接

### 添加新的 AI 提供商

在 `providers.py` 中添加新函数：

```python
async def call_new_provider(model: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    # 实现你的 AI 调用逻辑
    pass
```

然后在 `call_provider` 函数中添加路由：
```python
if provider == "new_provider":
    return await call_new_provider(model, prompt, params)
```
