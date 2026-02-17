"""
LexGuard 백엔드 API
FastAPI 기반 계약서 분석 서버 (OCR + AI 분석 + Firebase 연동)
"""
import os
import io
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# --- Firebase Admin SDK ---
import firebase_admin
from firebase_admin import credentials, auth, firestore

# 유틸리티 임포트
from utils.ocr_service import run_ocr
from utils.analyze_contract import split_clauses
from utils.rag_retriever import retrieve_related_laws
from utils.llm_service import analyze_all_clauses_batch
from utils.pdf_highlighter import highlight_pdf, create_highlighted_pdf_with_text

load_dotenv()

# --- Firebase 초기화 (절대 경로 사용으로 에러 방지) ---
try:
    if not firebase_admin._apps:
        # 1. 현재 실행 중인 main.py 파일의 절대 경로를 찾습니다.
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 2. 같은 폴더에 있는 serviceAccountKey.json 경로를 만듭니다.
        key_path = os.path.join(current_dir, "serviceAccountKey.json")
        
        # 3. 키 파일이 있는지 확인하고 초기화
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print(f"[INFO] Firebase Admin SDK 초기화 성공 (Key: {key_path})")
        else:
            print(f"[WARNING] 키 파일을 찾을 수 없습니다: {key_path}")
            print("serviceAccountKey.json 파일을 backend 폴더(main.py와 같은 위치)에 넣어주세요.")

    db = firestore.client()

except Exception as e:
    print(f"[ERROR] Firebase 초기화 중 오류 발생: {e}")


app = FastAPI(
    title="LexGuard API",
    description="AI 기반 계약서 리스크 분석 API (OCR + GPT + Firebase)",
    version="3.3.0"
)

# 정적 파일 경로 설정 (절대 경로)
current_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(current_dir, "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 변수 (임시 저장소)
last_analysis = {
    "original_file": None,
    "results": None,
    "raw_text": None,
    "filename": None
}

# 지원 파일 타입 설정
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "application/x-hwp": "hwp",
    "application/haansofthwp": "hwp",
    "application/vnd.hancom.hwp": "hwp",
    "application/vnd.hancom.hwpx": "hwpx",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
}
ALLOWED_EXTENSIONS = ['pdf', 'docx', 'hwp', 'hwpx', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif']

def is_allowed_file(file: UploadFile) -> bool:
    if file.content_type in ALLOWED_TYPES:
        return True
    ext = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
    if ext in ALLOWED_EXTENSIONS:
        return True
    return False

# --- [핵심 수정] 코인 차감 미들웨어 함수 (트랜잭션 제거로 에러 해결) ---
async def verify_and_deduct_coins(authorization: str = Header(None)):
    """
    헤더의 토큰을 검증하고 코인을 차감합니다.
    """
    # 1. 토큰 존재 여부 확인
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="로그인이 필요한 서비스입니다.")

    try:
        # 2. 토큰에서 UID 추출
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # 3. Firestore에서 유저 정보 가져오기
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get() # 일반 get() 사용 (트랜잭션 X)
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="사용자 정보를 찾을 수 없습니다.")
            
        user_data = user_doc.to_dict()
        # coins가 없으면 tokens를 확인하고, 둘 다 없으면 0
        current_coins = user_data.get('coins', user_data.get('tokens', 0))
        COST = 5 # 1회 분석 비용
        
        # 4. 잔액 부족 확인
        if current_coins < COST:
            raise HTTPException(status_code=402, detail=f"코인이 부족합니다. (보유: {current_coins}, 필요: {COST})")
            
        # 5. 코인 차감 및 통계 업데이트 (안전한 Increment 방식 사용)
        user_ref.update({
            "coins": firestore.Increment(-COST),
            "tokensUsed": firestore.Increment(COST),
            "analysisCount": firestore.Increment(1)
        })
        
        print(f"[INFO] User {uid}: 5 coins deducted. Remaining: {current_coins - COST}")
        return uid

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] 코인 차감 중 에러 발생: {str(e)}")
        # 인증 관련 에러 처리
        if "firebase" in str(e).lower() or "expired" in str(e).lower():
             raise HTTPException(status_code=401, detail="인증 세션이 만료되었습니다. 다시 로그인해주세요.")
        # 기타 서버 에러
        raise HTTPException(status_code=500, detail=f"서버 에러: {str(e)}")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "LexGuard API Server v3.3 Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# --- 분석 API (코인 차감 적용) ---
@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...), 
    lang: str = "ko",
    # 의존성 주입: 여기서 verify_and_deduct_coins 함수가 실행됨
    uid: str = Depends(verify_and_deduct_coins) 
):
    try:
        print(f"\n{'=' * 80}")
        print(f"[INFO] 분석 시작: {file.filename} (User: {uid})")
        print(f"{'=' * 80}")

        # 파일 읽기
        file_contents = await file.read()
        await file.seek(0)
        
        if len(file_contents) > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="파일 크기는 20MB를 초과할 수 없습니다.")

        if not is_allowed_file(file):
            raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다.")

        # [STEP 1] OCR 수행
        raw_text = await run_ocr(file, lang_code=lang)
        if not raw_text or len(raw_text) < 10:
            raise HTTPException(status_code=400, detail="텍스트를 추출할 수 없습니다.")

        # [STEP 2] 조항 분리
        clauses = split_clauses(raw_text)
        if not clauses: clauses = [raw_text]

        # [STEP 3] 법률 검색
        related_laws_per_clause = [retrieve_related_laws(c) for c in clauses]

        # [STEP 4] GPT 분석
        analysis_results = analyze_all_clauses_batch(clauses, related_laws_per_clause)

        # 결과 매핑
        final_results = []
        risk_count = 0 
        
        for i, clause in enumerate(clauses):
            analysis = None
            for res in analysis_results:
                if res.get("clause_number") == i + 1:
                    analysis = res
                    break
            
            if not analysis:
                analysis = {
                    "violation": False, "law_reference": "N/A", 
                    "explanation": "분석 실패", "severity": "NONE"
                }
            
            if analysis.get('severity') in ['CRITICAL', 'WARNING']:
                risk_count += 1
                
            analysis["clause"] = clause
            final_results.append(analysis)

        # [통계 업데이트] 발견된 위험 수
        if risk_count > 0:
            db.collection('users').document(uid).update({
                "totalRisksFound": firestore.Increment(risk_count)
            })

        # 전역 저장
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

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- 다운로드 API ---
@app.get("/api/download-highlighted-pdf")
async def download_highlighted_pdf():
    try:
        if not last_analysis.get("results"):
            raise HTTPException(status_code=400, detail="분석 결과가 없습니다.")
        
        original_file = last_analysis["original_file"]
        results = last_analysis["results"]
        filename = last_analysis.get("filename", "contract.pdf")
        
        if filename.lower().endswith('.pdf'):
            pdf_bytes = highlight_pdf(original_file, results)
        else:
            pdf_bytes = create_highlighted_pdf_with_text(last_analysis["raw_text"], results)
            
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=analyzed_{filename}.pdf"}
        )
    except Exception as e:
        print(f"[ERROR] PDF 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="PDF 생성 실패")

@app.get("/api/download-template")
async def download_template():
    # 템플릿 파일 경로도 절대 경로로 안전하게 처리
    template_path = os.path.join(static_path, "employment_contract.hwp")
    if not os.path.exists(template_path):
        # 파일이 없으면 더미 파일 생성 (에러 방지용)
        with open(template_path, "w", encoding="utf-8") as f:
            f.write("표준계약서 샘플입니다.")
            
    return FileResponse(template_path, filename="표준근로계약서.hwp")

if __name__ == "__main__":
    import uvicorn
    print("LexGuard 백엔드 서버 시작 (v3.3 - Stable)")
    print(f"지원 형식: {', '.join(ALLOWED_EXTENSIONS)}")
    uvicorn.run(app, host="0.0.0.0", port=8000)