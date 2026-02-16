import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# 참조 오류 해결: 실행 경로에 맞춰 유연하게 처리
try:
    from backend.prompts.analysis_prompt import SYSTEM_PROMPT, build_analysis_prompt
except ImportError:
    try:
        from prompts.analysis_prompt import SYSTEM_PROMPT, build_analysis_prompt
    except ImportError:
        # 최후의 수단: 직접 정의 (비상용)
        SYSTEM_PROMPT = "너는 근로기준법 전문가이다."

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_batch_analysis_prompt(clauses: list, related_laws_per_clause: list):
    """
    일괄 분석용 프롬프트 생성 - 4단계 등급 체계 및 문구 추출 강화
    """
    prompt = """너는 대한민국 근로기준법 및 관련 판례(data/labor_law_articles)를 완벽히 숙지한 법률 전문가이다.
다음 근로계약서의 각 조항을 정밀 분석하여 JSON 배열로 응답하라.

## 분석 지침:
1. 반드시 제공된 [관련 법률 정보] 텍스트를 최우선 근거로 사용하여 분석하라.
2. [위험 등급 판정 기준]:
   - CRITICAL: 강행규정 위반, 명백한 불법 (예: 최저임금 미달, 해고예고수당 미준수).
   - WARNING: 법적 분쟁 소지, 판례상 요건 불충분 (예: 포괄임금제 오용).
   - DISADVANTAGE: 근로자에게 일방적 독소 조항, 정보 누락으로 인한 불리함.
   - SAFE: 근로기준법 준수 및 표준 양식 부합.
3. 문구 추출: 해당 조항 내에서 문제가 되는 구체적인 문장을 'original_text'에 그대로 발췌할 것.
4. 수정 제안: 'suggestion' 필드에 "~로 수정하여 권리를 보호받으십시오"라는 구체적인 문구를 작성할 것.

## 분석할 조항들:
"""

    for i, clause in enumerate(clauses):
        related_laws = related_laws_per_clause[i] if i < len(related_laws_per_clause) else []
        prompt += f"\n### 조항 {i + 1}:\n"
        prompt += f"[계약 조항]\n{clause}\n"

        if related_laws:
            prompt += f"\n[관련 법률 정보]\n"
            for law in related_laws[:3]:
                if isinstance(law, dict):
                    prompt += f"[{law.get('article_id', 'N/A')}] {law.get('content', '')}\n"
                else:
                    prompt += f"- {law}\n"
        else:
            prompt += "\n[관련 법률 정보]\n참조할 구체적 법 조항 없음\n"

    prompt += """
## 응답 형식 (JSON 배열 형식 필수):
{
  "results": [
    {
      "clause_number": 1,
      "original_text": "문제가 되는 실제 문구 발췌",
      "violation": true,
      "law_reference": "근로기준법 제00조",
      "explanation": "법적 근거에 따른 상세 설명",
      "severity": "CRITICAL",
      "suggestion": "유리하게 변경할 수정 문구 제안"
    }
  ]
}
"""
    return prompt


def analyze_all_clauses_batch(clauses: list, related_laws_per_clause: list):
    """
    메인 분석 함수: main.py에서 호출하는 함수
    """
    print(f"\n[DEBUG] 일괄 분석 시작 - 총 {len(clauses)}개 조항")

    prompt = build_batch_analysis_prompt(clauses, related_laws_per_clause)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )

        text = response.choices[0].message.content.strip()
        parsed = json.loads(text)
        results = parsed.get("results", [])

        # 필수 필드 검증 및 4단계 등급 보정
        for i, result in enumerate(results):
            # severity 보정
            sev = result.get("severity", "DISADVANTAGE").upper()
            if sev in ["HIGH", "CRITICAL"]:
                result["severity"] = "CRITICAL"
            elif sev in ["MEDIUM", "WARNING"]:
                result["severity"] = "WARNING"
            elif sev in ["LOW", "DISADVANTAGE", "NONE"]:
                result["severity"] = "DISADVANTAGE"
            elif sev == "SAFE":
                result["severity"] = "SAFE"
            else:
                result["severity"] = "DISADVANTAGE"

            # original_text 누락 시 보정
            if "original_text" not in result:
                idx = result.get("clause_number", i + 1) - 1
                result["original_text"] = clauses[idx][:50] if idx < len(clauses) else "문구 발췌 불가"

            # suggestion 누락 시 보정
            if "suggestion" not in result:
                result["suggestion"] = "해당 조항에 대한 구체적인 보완이 필요합니다."

        return results

    except Exception as e:
        print(f"[ERROR] 일괄 분석 중 에러 발생: {str(e)}")
        return []


def analyze_clause(clause: str, related_laws: list):
    """
    단일 조항 분석 (레거시 지원용)
    """
    print(f"\n[DEBUG] 단일 조항 분석 시작")
    prompt = build_analysis_prompt(clause, related_laws)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )

        text = response.choices[0].message.content.strip()
        result = json.loads(text)

        # 등급 보정
        sev = result.get("severity", "DISADVANTAGE").upper()
        if sev in ["HIGH", "CRITICAL"]:
            result["severity"] = "CRITICAL"
        elif sev in ["MEDIUM", "WARNING"]:
            result["severity"] = "WARNING"
        elif sev in ["LOW", "DISADVANTAGE", "NONE"]:
            result["severity"] = "DISADVANTAGE"
        elif sev == "SAFE":
            result["severity"] = "SAFE"
        else:
            result["severity"] = "DISADVANTAGE"

        return result
    except Exception as e:
        print(f"[ERROR] 단일 분석 에러: {str(e)}")
        return {"severity": "DISADVANTAGE", "explanation": "분석에 실패했습니다."}