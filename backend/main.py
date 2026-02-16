<<<<<<< HEAD
"""
LexGuard 백엔드 API
FastAPI 기반 계약서 분석 서버 (OCR + AI 분석)
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os
import io

# 기존 강력한 분석 도구들
from utils.ocr_service import run_ocr
from utils.analyze_contract import split_clauses
from utils.rag_retriever import retrieve_related_laws
from utils.llm_service import analyze_all_clauses_batch
from utils.pdf_highlighter import highlight_pdf, create_highlighted_pdf_with_text

load_dotenv()

app = FastAPI(
    title="LexGuard API",
    description="AI 기반 계약서 리스크 분석 API (OCR + GPT)",
    version="3.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000"],
=======
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from utils.file_parser import parse_document
from utils.contract_analyzer import analyze_contract

# 환경변수 로드
load_dotenv()

app = FastAPI(title="LexGuard API")

# CORS 설정 (React가 백엔드 호출 가능하게)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 개발 서버
>>>>>>> origin/mypage
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# 전역 변수로 마지막 분석 결과 임시 저장
last_analysis = {
    "original_file": None,
    "results": None,
    "raw_text": None,
    "filename": None
}


# ============================================
# 데이터 모델
# ============================================

class RiskDetail(BaseModel):
    id: str
    severity: str
    title: str
    description: str
    legalBasis: str
    suggestion: str
    position: Optional[dict] = None


class AnalysisResult(BaseModel):
    success: bool
    total_clauses: int
    analysis: List[dict]
    raw_text: Optional[str] = None
    metadata: Optional[dict] = None


# ============================================
# 헬스체크 & 상태 확인
# ============================================

@app.get("/")
def read_root():
    """API 상태 확인"""
    return {
        "status": "ok",
        "message": "LexGuard API 서버가 정상 작동 중입니다",
        "version": "3.0.0",
        "features": {
            "ocr": True,
            "gptAnalysis": True,
            "pdfHighlight": True,
            "templateDownload": True
        }
    }

=======
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
>>>>>>> origin/mypage

@app.get("/health")
def health_check():
    """서버 상태 체크"""
    openai_key = os.getenv("OPENAI_API_KEY")
    return {
        "status": "healthy",
<<<<<<< HEAD
        "openai_configured": bool(openai_key),
        "ocr_available": True,
        "pdf_tools_available": True
    }


# ============================================
# 메인 분석 엔드포인트
# ============================================

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...), lang: str = "ko"):
    """
    계약서 OCR + AI 분석 (통합 버전)

    - OCR로 텍스트 추출 (PDF, DOCX, 이미지)
    - 조항 자동 분리
    - 관련 법률 검색
    - GPT 기반 위험도 분석
    """
    try:
        print(f"\n{'=' * 80}")
        print(f"[INFO] 분석 시작: {file.filename}")
        print(f"{'=' * 80}")

        # 원본 파일 저장 (하이라이트용)
        file_contents = await file.read()
        await file.seek(0)  # 파일 포인터 리셋

        # 1. 파일 타입 체크
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg"
        ]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="PDF, DOCX, PNG, JPG 파일만 업로드 가능합니다."
            )

        file_size = len(file_contents)
        if file_size > 20 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="파일 크기는 20MB를 초과할 수 없습니다."
            )

        # 2. OCR 수행
        print("\n[STEP 1] OCR 수행")
        raw_text = await run_ocr(file, lang_code=lang)
        print(f"[RESULT] OCR 결과: {len(raw_text)} 글자")

        if not raw_text or len(raw_text) < 10:
            raise HTTPException(
                status_code=400,
                detail="텍스트를 추출할 수 없습니다."
            )

        # 3. 조항 분리
        print("\n[STEP 2] 조항 분리")
        clauses = split_clauses(raw_text)
        print(f"[RESULT] {len(clauses)}개 조항 추출")

        if not clauses:
            clauses = [raw_text]

        # 4. 관련 법률 검색
        print("\n[STEP 3] 관련 법률 검색")
        related_laws_per_clause = []
        for i, clause in enumerate(clauses):
            laws = retrieve_related_laws(clause)
            related_laws_per_clause.append(laws)
            print(f"[DEBUG] 조항 {i + 1}: {len(laws)}개 법률")

        # 5. GPT 일괄 분석
        print("\n[STEP 4] GPT 분석")
        analysis_results = analyze_all_clauses_batch(clauses, related_laws_per_clause)

        # 6. 결과 매핑
        results = []
        for i, clause in enumerate(clauses):
            analysis = None
            for result in analysis_results:
                if result.get("clause_number") == i + 1:
                    analysis = result
                    break

            if not analysis:
                analysis = {
                    "violation": False,
                    "law_reference": "분석 없음",
                    "explanation": "분석 결과를 찾을 수 없습니다.",
                    "severity": "NONE"
                }

            analysis["clause"] = clause
            results.append(analysis)

        # 전역 변수에 저장 (하이라이트용)
        last_analysis["original_file"] = file_contents
        last_analysis["results"] = results
        last_analysis["raw_text"] = raw_text
        last_analysis["filename"] = file.filename

        print(f"\n{'=' * 80}")
        print("[INFO] 분석 완료")
        print(f"{'=' * 80}\n")

        # JSON 응답 반환
        return {
            "success": True,
            "total_clauses": len(clauses),
            "analysis": results,
            "raw_text": raw_text[:500],  # 미리보기용
            "metadata": {
                "filename": file.filename,
                "fileSize": file_size,
                "textLength": len(raw_text),
                "clauseCount": len(clauses)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"분석 중 오류: {str(e)}"
        )


# ============================================
# PDF 하이라이트 다운로드
# ============================================

@app.get("/api/download-highlighted-pdf")
async def download_highlighted_pdf():
    """
    분석 결과가 하이라이트된 PDF 다운로드
    - 위험 조항: 빨간색
    - 주의 조항: 노란색
    - 안전 조항: 초록색
    """
    try:
        if not last_analysis.get("results"):
            raise HTTPException(
                status_code=400,
                detail="먼저 계약서를 분석해주세요."
            )

        original_file = last_analysis["original_file"]
        results = last_analysis["results"]
        filename = last_analysis.get("filename", "contract.pdf")

        print(f"\n[INFO] PDF 하이라이트 생성: {filename}")

        # PDF인 경우 하이라이트 추가
        if filename.lower().endswith('.pdf'):
            highlighted_pdf = highlight_pdf(original_file, results)
        else:
            # PDF가 아닌 경우 텍스트로부터 PDF 생성
            raw_text = last_analysis.get("raw_text", "")
            highlighted_pdf = create_highlighted_pdf_with_text(raw_text, results)

        if not highlighted_pdf:
            raise HTTPException(
                status_code=500,
                detail="PDF 생성에 실패했습니다."
            )

        # 파일명 생성
        base_filename = filename.replace('.pdf', '').replace('.docx', '').replace('.png', '').replace('.jpg', '')
        output_filename = f"highlighted_{base_filename}.pdf"

        print(f"[SUCCESS] PDF 하이라이트 완료: {output_filename}")

        # 스트리밍 응답
        return StreamingResponse(
            io.BytesIO(highlighted_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={output_filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] PDF 다운로드 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"PDF 생성 중 오류: {str(e)}"
        )


# ============================================
# 표준 근로계약서 다운로드
# ============================================

@app.get("/api/download-template")
async def download_template():
    """
    표준 근로계약서 양식 다운로드
    - 고용노동부 표준 양식
    """
    try:
        # templates 폴더에서 표준 근로계약서 제공
        template_path = "templates/standard_contract_template.pdf"

        if not os.path.exists(template_path):
            raise HTTPException(
                status_code=404,
                detail="표준 근로계약서 양식을 찾을 수 없습니다. templates 폴더에 파일을 추가해주세요."
            )

        print(f"[INFO] 템플릿 다운로드: {template_path}")

        return FileResponse(
            path=template_path,
            media_type="application/pdf",
            filename="표준근로계약서.pdf"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] 템플릿 다운로드 실패: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"템플릿 다운로드 중 오류: {str(e)}"
        )


# ============================================
# 추가 유틸리티 엔드포인트
# ============================================

@app.get("/api/templates")
def get_templates():
    """계약서 템플릿 목록"""
    return {
        "templates": [
            {"id": "employment", "name": "근로계약서", "category": "노동"},
            {"id": "nda", "name": "비밀유지계약서", "category": "일반"},
            {"id": "service", "name": "용역계약서", "category": "일반"}
        ]
    }


@app.get("/api/statistics")
def get_statistics():
    """서비스 통계 (데모)"""
    return {
        "totalAnalyses": 1234,
        "averageRisks": 2.5,
        "mostCommonRisk": "부당해고 조항",
        "averageProcessingTime": "3.2s"
    }


@app.post("/api/extract-text")
async def extract_text_only(file: UploadFile = File(...), lang: str = "ko"):
    """
    파일에서 텍스트만 추출 (디버깅용)
    """
    try:
        raw_text = await run_ocr(file, lang_code=lang)

        return {
            "success": True,
            "filename": file.filename,
            "text": raw_text,
            "length": len(raw_text),
            "preview": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# 서버 실행
# ============================================

if __name__ == "__main__":
    import uvicorn

    print("LexGuard 백엔드 서버 시작...")
    print(f" OCR: 활성화")
    print(f" GPT 분석: 활성화")
    print(f"PDF 하이라이트: 활성화")
=======
        "openai_configured": bool(openai_key)
    }

if __name__ == "__main__":
    import uvicorn
>>>>>>> origin/mypage
    uvicorn.run(app, host="0.0.0.0", port=8000)