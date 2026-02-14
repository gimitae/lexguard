from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from backend.utils.file_parser import parse_document
from backend.utils.contract_analyzer import analyze_contract

# 환경변수 로드
load_dotenv()

app = FastAPI(title="LexGuard API")

# CORS 설정 (React가 백엔드 호출 가능하게)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "LexGuard API is running"}

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """
    계약서 파일을 받아서 OpenAI로 리스크 분석
    """
    try:
        # 1. 파일 타입 체크
        allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="PDF 또는 DOCX 파일만 업로드 가능합니다.")
        
        # 2. 파일 크기 체크 (20MB)
        content = await file.read()
        if len(content) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="파일 크기는 20MB를 초과할 수 없습니다.")
        
        # 3. 파일 파싱 (텍스트 추출)
        document_text = parse_document(content, file.filename)
        
        if not document_text or len(document_text.strip()) == 0:
            raise HTTPException(status_code=400, detail="파일에서 텍스트를 추출할 수 없습니다.")
        
        # 4. OpenAI로 분석
        analysis_result = await analyze_contract(document_text)
        
        return analysis_result
    
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 중 오류가 발생했습니다: {str(e)}")

@app.get("/health")
def health_check():
    """서버 상태 체크"""
    openai_key = os.getenv("OPENAI_API_KEY")
    return {
        "status": "healthy",
        "openai_configured": bool(openai_key)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)