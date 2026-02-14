import os
import json
from openai import AsyncOpenAI

# OpenAI 클라이언트 초기화
client = AsyncOpenAI(api_key="")


async def analyze_contract(document_text: str) -> dict:
    """
    OpenAI GPT-4를 사용하여 계약서 리스크 분석
    
    Args:
        document_text: 계약서 텍스트
    
    Returns:
        분석 결과 (risks, details)
    """
    
    system_prompt = """당신은 대한민국 노동법 전문 변호사입니다. 
계약서를 분석하여 법적 리스크를 찾아내는 전문가입니다.

계약서를 분석할 때:
1. 근로기준법, 민법 등 관련 법률 위반 사항 찾기
2. 불공정하거나 일방적으로 불리한 조항 찾기
3. 각 리스크에 대해 법적 근거와 수정 권장안 제시

응답은 반드시 다음 JSON 형식으로 작성하세요:
{
  "risks": {
    "critical": 0,
    "warning": 0,
    "info": 0
  },
  "details": [
    {
      "id": "R1",
      "severity": "high",
      "title": "리스크 제목",
      "description": "구체적인 설명",
      "legalBasis": "법적 근거 (예: 근로기준법 제23조)",
      "suggestion": "수정 권장안",
      "originalText": "문제가 되는 원문",
      "position": {
        "start": 0,
        "end": 50
      }
    }
  ]
}

severity는 "high", "medium", "low" 중 하나여야 합니다.
"""

    user_prompt = f"""다음 계약서를 분석해주세요:

{document_text}

위 계약서에서 법적 리스크를 찾아 JSON 형식으로 응답해주세요."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",  # 또는 "gpt-4o" (더 정확하지만 비쌈)
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # 일관성 있는 답변을 위해 낮은 값
            response_format={"type": "json_object"}  # JSON 응답 강제
        )
        
        # JSON 파싱
        result = json.loads(response.choices[0].message.content)
        
        # 결과 검증 및 후처리
        if "risks" not in result:
            result["risks"] = {"critical": 0, "warning": 0, "info": 0}
        
        if "details" not in result:
            result["details"] = []
        
        # severity에 따라 risks 카운트 업데이트
        critical = sum(1 for d in result["details"] if d.get("severity") == "high")
        warning = sum(1 for d in result["details"] if d.get("severity") == "medium")
        info = sum(1 for d in result["details"] if d.get("severity") == "low")
        
        result["risks"]["critical"] = critical
        result["risks"]["warning"] = warning
        result["risks"]["info"] = info
        
        return result
    
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        # 에러 발생 시 기본 응답
        return {
            "risks": {"critical": 0, "warning": 0, "info": 0},
            "details": [],
            "error": str(e)
        }