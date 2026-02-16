import os
import io
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# 분석 도구 라이브러리 임포트
from utils.ocr_service import run_ocr
from utils.analyze_contract import split_clauses
from utils.rag_retriever import retrieve_related_laws
from utils.llm_service import analyze_all_clauses_batch
from utils.pdf_highlighter import highlight_pdf, create_highlighted_pdf_with_text

# 환경변수 로드
load_dotenv()

app = FastAPI(
    title="LexGuard API",
    description="AI 기반 계약서 리스크 분석 API (OCR + RAG + GPT)",
    version="3.0.0"
)

# 1. 정적 파일 설정 (backend/static 폴더를 /static 경로로 마운트)
# 이 설정이 있어야 서버 내의 파일을 브라우저가 접근할 수 있습니다.
static_path = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# 2. CORS 설정: 프론트엔드 접속 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 분석 결과 임시 저장소
last_analysis = {
    "original_file": None,
    "results": None,
    "raw_text": None,
    "filename": None
}


# --- 데이터 모델 정의 ---
class AnalysisResult(BaseModel):
    success: bool
    total_clauses: int
    analysis: List[dict]
    raw_text: Optional[str] = None
    metadata: Optional[dict] = None


# --- 기본 엔드포인트 ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "LexGuard API 서버 정상 작동 중"}


# --- 메인 분석 기능 ---

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...), lang: str = "ko"):
    try:
        print(f"[INFO] 분석 시작: {file.filename}")
        file_contents = await file.read()
        await file.seek(0)

        # OCR 추출
        raw_text = await run_ocr(file, lang_code=lang)
        if not raw_text or len(raw_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="텍스트를 추출할 수 없습니다.")

        # 조항 분리 및 법률 검색
        clauses = split_clauses(raw_text)
        if not clauses: clauses = [raw_text]
        related_laws_per_clause = [retrieve_related_laws(clause) for clause in clauses]

        # LLM 분석 (배치 처리)
        analysis_results = analyze_all_clauses_batch(clauses, related_laws_per_clause)

        # 데이터 매핑 (4단계 severity 보정 로직은 llm_service 내부에서 처리됨)
        final_results = []
        for i, clause in enumerate(clauses):
            analysis = next((res for res in analysis_results if res.get("clause_number") == i + 1), {
                "violation": False,
                "law_reference": "N/A",
                "explanation": "분석 결과 생성 실패",
                "severity": "DISADVANTAGE",
                "original_text": clause[:50]
            })
            analysis["clause"] = clause
            final_results.append(analysis)

        # 세션 업데이트
        last_analysis.update({
            "original_file": file_contents,
            "results": final_results,
            "raw_text": raw_text,
            "filename": file.filename
        })

        return {
            "success": True,
            "total_clauses": len(clauses),
            "analysis": final_results,
            "metadata": {"filename": file.filename}
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- 다운로드 기능 ---

@app.get("/api/download-template")
async def download_template():
    """
    backend/static/employment_contract.hwp 파일을 반환합니다.
    """
    # 파일 경로 설정
    file_path = os.path.join(static_path, "employment_contract.hwp")

    if not os.path.exists(file_path):
        print(f"[ERROR] 파일을 찾을 수 없음: {file_path}")
        raise HTTPException(status_code=404, detail="표준계약서 양식 파일이 서버에 없습니다.")

    return FileResponse(
        path=file_path,
        filename="표준근로계약서_양식.hwp",  # 사용자가 다운로드 받을 때의 이름
        media_type='application/octet-stream'
    )


@app.get("/api/download-highlighted-pdf")
async def download_highlighted_pdf():
    if not last_analysis.get("results"):
        raise HTTPException(status_code=400, detail="분석 결과가 없습니다.")
    try:
        original_file = last_analysis["original_file"]
        results = last_analysis["results"]
        filename = last_analysis["filename"]

        if filename.lower().endswith('.pdf'):
            highlighted_pdf = highlight_pdf(original_file, results)
        else:
            highlighted_pdf = create_highlighted_pdf_with_text(last_analysis["raw_text"], results)

        return StreamingResponse(
            io.BytesIO(highlighted_pdf),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=analysis_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="PDF 생성 실패")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)