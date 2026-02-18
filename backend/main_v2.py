"""
바른계약 백엔드 API (v2 - 텍스트 추출 포함)
FastAPI 기반 계약서 분석 서버
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

# 유틸리티 함수 import
try:
    from utils2 import extract_text_from_file, analyze_contract_text
    TEXT_EXTRACTION_AVAILABLE = True
except Exception as e:
    TEXT_EXTRACTION_AVAILABLE = False
    print(f"utils.py를 찾을 수 없습니다. 기본 모의 분석 모드로 실행합니다.{e}")

app = FastAPI(
    title="바른계약 API",
    description="AI 기반 계약서 리스크 분석 API",
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    risks: dict
    details: List[RiskDetail]
    metadata: Optional[dict] = None  # 추가 메타데이터

# ============================================
# 헬스체크
# ============================================

@app.get("/")
def read_root():
    """API 상태 확인"""
    return {
        "status": "ok",
        "message": "바른계약 API 서버가 정상 작동 중입니다",
        "version": "2.0.0",
        "features": {
            "textExtraction": TEXT_EXTRACTION_AVAILABLE,
            "aiAnalysis": False  # 향후 추가
        }
    }

@app.get("/health")
def health_check():
    """헬스체크"""
    return {"status": "healthy", "textExtraction": TEXT_EXTRACTION_AVAILABLE}

# ============================================
# 파일 업로드 & 분석
# ============================================

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_contract(file: UploadFile = File(...)):
    """
    계약서 파일을 분석합니다.
    
    - PDF/DOCX에서 텍스트 추출
    - 리스크 키워드 검색
    - 분석 결과 반환
    """
    
    # 1. 파일 검증
    if not file.filename:
        raise HTTPException(status_code=400, detail="파일이 선택되지 않았습니다.")
    
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['pdf', 'docx']:
        raise HTTPException(status_code=400, detail="PDF 또는 DOCX 파일만 가능합니다.")
    
    # 파일 읽기
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="파일 크기는 20MB 이하여야 합니다.")
    
    print(f"분석 시작: {file.filename} ({file_size} bytes)")
    
    # 2. 텍스트 추출 시도
    extracted_text = None
    if TEXT_EXTRACTION_AVAILABLE:
        try:
            extracted_text = extract_text_from_file(file_content, file_ext)
            print(f"텍스트 추출 성공: {len(extracted_text)} 글자")
        except Exception as e:
            print(f"텍스트 추출 실패: {str(e)}")
    
    # 3. 분석 수행
    time.sleep(1)  # 분석 시뮬레이션
    
    if extracted_text and TEXT_EXTRACTION_AVAILABLE:
        # 실제 텍스트 기반 분석
        analysis_result = analyze_contract_text(extracted_text)
        
        # 결과를 API 형식으로 변환
        details = []
        for idx, risk in enumerate(analysis_result.get('found_risks', [])):
            details.append({
                "id": f"R{idx+1}",
                "severity": risk['severity'],
                "title": f"{risk['keyword']} 관련 조항",
                "description": f"계약서에서 '{risk['keyword']}'가 발견되었습니다. {risk['context']}",
                "legalBasis": "검토 필요",
                "suggestion": f"'{risk['keyword']}' 조항을 법률 전문가와 상담하시기 바랍니다.",
                "position": None
            })
        
        critical = sum(1 for r in analysis_result['found_risks'] if r['severity'] == 'high')
        warning = sum(1 for r in analysis_result['found_risks'] if r['severity'] == 'medium')
        
        result = {
            "risks": {
                "critical": critical,
                "warning": warning,
                "info": 0
            },
            "details": details,
            "metadata": {
                "filename": file.filename,
                "fileSize": file_size,
                "textLength": analysis_result.get('text_length', 0),
                "wordCount": analysis_result.get('word_count', 0)
            }
        }
    else:
        # 텍스트 추출 불가 시 기본 모의 데이터
        result = {
            "risks": {
                "critical": 0,
                "warning": 0,
                "info": 0
            },
            "details": [
                
            ],
            "metadata": {
                "filename": file.filename,
                "fileSize": file_size,
                "note": "텍스트 추출이 불가능합니다. 파일을 다시한번 확인해주세요."
            }
        }
    
    print(f"분석 완료: {len(result['details'])}개 이슈")
    return result

# ============================================
# 추가 엔드포인트
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
    """서비스 통계"""
    return {
        "totalAnalyses": 1234,
        "averageRisks": 2.5,
        "mostCommonRisk": "부당해고 조항",
        "averageProcessingTime": "3.2s"
    }

@app.post("/api/extract-text")
async def extract_text_only(file: UploadFile = File(...)):
    """
    파일에서 텍스트만 추출 (디버깅용)
    """
    if not TEXT_EXTRACTION_AVAILABLE:
        raise HTTPException(status_code=503, detail="텍스트 추출 기능이 비활성화되었습니다.")
    
    file_ext = file.filename.split('.')[-1].lower()
    file_content = await file.read()
    
    try:
        text = extract_text_from_file(file_content, file_ext)
        return {
            "filename": file.filename,
            "text": text,
            "length": len(text),
            "preview": text[:500] + "..." if len(text) > 500 else text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("바른계약 백엔드 서버 시작...")
    print(f"텍스트 추출: {'활성화' if TEXT_EXTRACTION_AVAILABLE else '비활성화'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)