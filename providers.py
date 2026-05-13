from typing import Any, Dict
import os
import httpx
from dotenv import load_dotenv

# Load .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def call_openai(model: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if not OPENAI_API_KEY:
        return {"text": "OpenAI API key not configured. Please set OPENAI_API_KEY."}
    
    if not OPENAI_BASE_URL:
        return {"text": "OpenAI Base URL not configured. Please set OPENAI_BASE_URL."}

    url = f"{OPENAI_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        **params,
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
            # Extract text from OpenAI response format
            if "choices" in data and len(data["choices"]) > 0:
                return {"text": data["choices"][0]["message"]["content"]}
            return data
    except Exception as e:
        return {"text": f"OpenAI API error: {str(e)}"}

async def call_azure_openai(model: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_DEPLOYMENT:
        return {"text": "Azure OpenAI credentials not configured. Please set AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT."}

    url = f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-06-01-preview"
    headers = {
        "api-key": AZURE_OPENAI_KEY,
        "Content-Type": "application/json",
    }
    body = {
        "messages": [{"role": "user", "content": prompt}],
        **params,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=body, headers=headers)
        response.raise_for_status()
        return response.json()

async def call_gemini(model: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return {"text": "Gemini API key not configured. Please set GEMINI_API_KEY."}

    try:
        import google.genai as genai
    except ImportError:
        import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    generation_config = genai.types.GenerationConfig(
        temperature=params.get("temperature", 0.7),
        max_output_tokens=params.get("max_tokens", 1000),
    )
    model_instance = genai.GenerativeModel(model_name=model, generation_config=generation_config)
    response = await model_instance.generate_content_async(prompt)
    return {"text": response.text}

async def call_provider(provider: str, model: str, prompt: str, params: Dict[str, Any]) -> Dict[str, Any]:
    if provider == "openai":
        return await call_openai(model, prompt, params)
    if provider == "azure":
        return await call_azure_openai(model, prompt, params)
    if provider == "gemini":
        return await call_gemini(model, prompt, params)
    raise ValueError(f"Unsupported provider: {provider}")
