# main.py 수정
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

load_dotenv()

from services.i18n import load_lang
from services.ocr_service import run_ocr
from services.contract_parser import split_clauses
from services.rag_retriever import retrieve_related_laws
from services.llm_service import analyze_all_clauses_batch  # 변경
from services.risk_scoring import calculate_total_risk

app = FastAPI()
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request, lang: str = "ko"):
    t = load_lang(lang)
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "t": t, "lang": lang, "analysis": None}
    )


@app.post("/analyze", response_class=HTMLResponse)
async def analyze(request: Request, file: UploadFile = File(...), lang: str = "ko"):
    print("\n" + "=" * 80)
    print("[INFO] 분석 요청 시작")
    print(f"[INFO] 파일명: {file.filename}")
    print(f"[INFO] 언어: {lang}")
    print("=" * 80)

    t = load_lang(lang)

    # Step 1: OCR
    print("\n[STEP 1] OCR 수행")
    raw_text = await run_ocr(file, lang_code=lang)
    print(f"[RESULT] OCR 결과 길이: {len(raw_text)} 글자")

    if not raw_text or len(raw_text) < 10:
        print("[ERROR] OCR 결과가 비어있거나 너무 짧음")
        return templates.TemplateResponse(
            "index.html",
            {
                "request": request,
                "t": t,
                "lang": lang,
                "error": "텍스트를 추출할 수 없습니다."
            }
        )

    # Step 2: 조항 분리
    print("\n[STEP 2] 조항 분리")
    clauses = split_clauses(raw_text)
    print(f"[RESULT] 추출된 조항 수: {len(clauses)}")

    if not clauses:
        print("[WARNING] 조항 분리 실패 - 전체 텍스트를 단일 조항으로 처리")
        clauses = [raw_text]

    for i, clause in enumerate(clauses[:5]):
        print(f"[DEBUG] 조항 {i + 1}: {clause[:80]}...")

    # Step 3: 관련 법률 검색 (각 조항별로)
    print("\n[STEP 3] 관련 법률 검색")
    related_laws_per_clause = []
    for i, clause in enumerate(clauses):
        laws = retrieve_related_laws(clause)
        related_laws_per_clause.append(laws)
        print(f"[DEBUG] 조항 {i + 1}: {len(laws)}개 법률 검색됨")

    # Step 4: 일괄 분석 (한 번의 API 호출)
    print("\n[STEP 4] GPT 일괄 분석")
    analysis_results = analyze_all_clauses_batch(clauses, related_laws_per_clause)

    # 결과 매핑
    results = []
    for i, clause in enumerate(clauses):
        # GPT 결과에서 해당 조항 찾기
        analysis = None
        for result in analysis_results:
            if result.get("clause_number") == i + 1:
                analysis = result
                break

        # 결과가 없으면 기본값
        if not analysis:
            analysis = {
                "violation": False,
                "law_reference": "분석 없음",
                "explanation": "분석 결과를 찾을 수 없습니다.",
                "severity": "NONE"
            }

        analysis["clause"] = clause
        results.append(analysis)

        print(f"[DEBUG] 조항 {i + 1} 결과: {analysis.get('severity')}")

    # Step 5: 위험도 계산
    print("\n[STEP 5] 전체 위험도 계산")
    risk_score = calculate_total_risk(results)
    print(f"[RESULT] 최종 위험도: {risk_score}")

    print("\n" + "=" * 80)
    print("[INFO] 분석 완료")
    print("=" * 80 + "\n")

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "t": t,
            "lang": lang,
            "risk_score": risk_score,
            "analysis": results
        }
    )