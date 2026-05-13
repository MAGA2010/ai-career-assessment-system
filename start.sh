#!/bin/bash

# Start the FastAPI application for AI Career Assessment
# Uses PORT environment variable (Railway) or defaults to 8000 for local development

uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}