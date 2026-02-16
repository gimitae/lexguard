"""
파일 처리 유틸리티
PDF, DOCX 파일에서 텍스트를 추출합니다.
"""
import io
from typing import Optional

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    PDF 파일에서 텍스트 추출
    
    Args:
        file_content: PDF 파일 바이너리 데이터
        
    Returns:
        str: 추출된 텍스트
    """
    try:
        import PyPDF2
        
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except ImportError:
        raise ImportError("PyPDF2가 설치되지 않았습니다. 'pip install PyPDF2'로 설치하세요.")
    except Exception as e:
        raise Exception(f"PDF 텍스트 추출 실패: {str(e)}")


def extract_text_from_docx(file_content: bytes) -> str:
    """
    DOCX 파일에서 텍스트 추출
    
    Args:
        file_content: DOCX 파일 바이너리 데이터
        
    Returns:
        str: 추출된 텍스트
    """
    try:
        from docx import Document
        
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text.strip()
    except ImportError:
        raise ImportError("python-docx가 설치되지 않았습니다. 'pip install python-docx'로 설치하세요.")
    except Exception as e:
        raise Exception(f"DOCX 텍스트 추출 실패: {str(e)}")


def extract_text_from_file(file_content: bytes, file_extension: str) -> str:
    """
    파일 형식에 따라 텍스트 추출
    
    Args:
        file_content: 파일 바이너리 데이터
        file_extension: 파일 확장자 ('pdf' 또는 'docx')
        
    Returns:
        str: 추출된 텍스트
    """
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_content)
    elif file_extension == 'docx':
        return extract_text_from_docx(file_content)
    else:
        raise ValueError(f"지원하지 않는 파일 형식: {file_extension}")


def analyze_contract_text(text: str) -> dict:
    """
    계약서 텍스트를 분석합니다. (향후 AI 모델로 교체)
    
    Args:
        text: 계약서 텍스트
        
    Returns:
        dict: 분석 결과
    """
    # TODO: 실제 AI 분석 로직으로 교체
    
    # 간단한 키워드 기반 분석 (데모용)
    high_risk_keywords = ["해고", "손해배상", "위약금", "별도 절차 없이"]
    medium_risk_keywords = ["경업금지", "비밀유지", "퇴사 후"]
    
    found_risks = []
    
    # 위험 키워드 검색
    for keyword in high_risk_keywords:
        if keyword in text:
            found_risks.append({
                "severity": "high",
                "keyword": keyword,
                "context": f"'{keyword}' 관련 조항 발견"
            })
    
    for keyword in medium_risk_keywords:
        if keyword in text:
            found_risks.append({
                "severity": "medium",
                "keyword": keyword,
                "context": f"'{keyword}' 관련 조항 발견"
            })
    
    return {
        "text_length": len(text),
        "word_count": len(text.split()),
        "found_risks": found_risks,
        "risk_count": len(found_risks)
    }


# 테스트 코드
if __name__ == "__main__":
    # PDF 테스트
    sample_text = """
    근로계약서
    
    제1조 (계약기간) 본 계약의 기간은 2024년 1월 1일부터 2024년 12월 31일까지로 한다.
    
    제2조 (해고) 갑은 경영상의 이유가 있을 경우 별도 절차 없이 을을 해고할 수 있다.
    
    제3조 (경업금지) 을은 퇴사 후 10년간 동종업종에 취업할 수 없다.
    """
    
    result = analyze_contract_text(sample_text)
    print("📊 분석 결과:")
    print(f"- 텍스트 길이: {result['text_length']}")
    print(f"- 단어 수: {result['word_count']}")
    print(f"- 발견된 리스크: {result['risk_count']}개")
    for risk in result['found_risks']:
        print(f"  - [{risk['severity']}] {risk['context']}")