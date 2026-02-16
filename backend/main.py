from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from dotenv import load_dotenv
import os
import io

from utils.ocr_service import run_ocr
from utils.analyze_contract import split_clauses
from utils.rag_retriever import retrieve_related_laws
from utils.llm_service import analyze_all_clauses_batch
from utils.pdf_highlighter import highlight_pdf, create_highlighted_pdf_with_text

load_dotenv()

app = FastAPI(title="LexGuard API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 변수로 마지막 분석 결과 임시 저장
last_analysis = {
    "original_file": None,
    "results": None,
    "raw_text": None,
    "filename": None
}


@app.get("/")
def read_root():
    return {"message": "LexGuard API is running"}


def calculate_risk_score(analysis_results):
    """
    분석 결과에서 위험도 점수 계산 (간단 버전)
    severity 기반으로 점수 산출
    """
    severity_weights = {
        "CRITICAL": 100,
        "HIGH": 75,
        "MEDIUM": 50,
        "LOW": 25,
        "NONE": 0
    }

    if not analysis_results:
        return 0

    total_score = sum(
        severity_weights.get(result.get("severity", "NONE"), 0)
        for result in analysis_results
    )

    # 평균 점수 (0-100)
    avg_score = total_score / len(analysis_results)
    return round(avg_score, 1)


@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...), lang: str = "ko"):
    """
    계약서 OCR + AI 분석 (통합 버전)
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

        # 7. 위험도 계산 (간단 버전)
        print("\n[STEP 5] 위험도 계산")
        risk_score = calculate_risk_score(results)
        print(f"[RESULT] 최종 위험도: {risk_score}")

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
            "risk_score": risk_score,
            "total_clauses": len(clauses),
            "analysis": results,
            "raw_text": raw_text[:500]  # 미리보기용
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


@app.get("/api/download-highlighted-pdf")
async def download_highlighted_pdf():
    """
    분석 결과가 하이라이트된 PDF 다운로드
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


@app.get("/api/download-template")
async def download_template():
    """
    표준 근로계약서 양식 다운로드
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