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
      "explanation": "설명",
      "severity": "CRITICAL",
      "suggestion": "수정 제안"
    }
  ]
}
"""
    return prompt


def analyze_all_clauses_batch(clauses: list, related_laws_per_clause: list):
    """
    메인 분석 함수: 조항별 개별 분석 (2안: 문맥 고려)
    전체 계약서의 맥락(Context)을 함께 전달하여, 단편적인 오판을 방지함.
    """
    print(f"\n[DEBUG] 개별 조항 분석 시작 (문맥 포함) - 총 {len(clauses)}개 조항")

    results = []

    # 전체 계약서 맥락 생성 (너무 길면 앞부분 3000자만 끊어서 전달 - 토큰 절약 및 핵심 파악)
    full_context = "\n".join(clauses)
    if len(full_context) > 3000:
        full_context = full_context[:3000] + "\n...(후략)..."

    for i, clause in enumerate(clauses):
        # 빈 조항 건너뜀
        if not clause.strip():
            continue

        print(f"[DEBUG] 조항 {i + 1}/{len(clauses)} 분석 중...")

        try:
            related_laws = related_laws_per_clause[i] if i < len(related_laws_per_clause) else []

            # 분석 호출 시 전체 맥락(full_context)을 함께 전달
            analysis = analyze_clause(clause, related_laws, context=full_context)

            analysis["clause_number"] = i + 1
            analysis["original_text"] = clause[:100]

            if "severity" not in analysis:
                analysis["severity"] = "DISADVANTAGE"

            results.append(analysis)

        except Exception as e:
            print(f"[ERROR] 조항 {i + 1} 분석 실패: {str(e)}")
            results.append({
                "clause_number": i + 1,
                "original_text": clause[:50],
                "violation": False,
                "severity": "DISADVANTAGE",
                "explanation": "분석 중 오류가 발생했습니다.",
                "suggestion": "전문가 검토가 필요합니다."
            })

    print(f"[SUCCESS] 총 {len(results)}개 조항 분석 완료")
    return results


def analyze_clause(clause: str, related_laws: list, context: str = ""):
    """
    단일 조항 분석 (문맥 포함)
    """
    # 프롬프트 구성 (문맥 추가)
    prompt = f"""너는 대한민국 근로기준법 및 관련 판례를 숙지한 법률 전문가이다.
다음 [분석 대상 조항]을 분석하여 법적 위험성을 판단하라.

## [전체 계약서 맥락]
(이 내용은 참고용이며, 분석 대상은 아님)
{context}

## [분석 대상 조항]
{clause}

## [관련 법률 정보]
"""
    if related_laws:
        for law in related_laws[:3]:
            if isinstance(law, dict):
                prompt += f"[{law.get('article_id', 'N/A')}] {law.get('content', '')}\n"
            else:
                prompt += f"- {law}\n"
    else:
        prompt += "참조할 법 조항 없음\n"

    prompt += """
## 분석 지침:
1. '분석 대상 조항'이 '전체 계약서 맥락' 내에서 유효한지 판단하라. (예: 조항 자체에는 내용이 없어도, 전체 맥락에서 다른 조항에 명시되어 있다면 유효함)
2. 그럼에도 법적 문제가 명백하다면 아래 기준에 따라 등급을 매겨라.
   - CRITICAL: 강행규정 위반 (예: 최저임금 미달)
   - WARNING: 법적 분쟁 소지
   - DISADVANTAGE: 불리한 조항
   - SAFE: 문제 없음 (또는 전체 맥락상 해결됨)
3. 응답은 반드시 JSON 형식이어야 한다.

## 응답 JSON 형식:
"모든 설명(explanation)과 제안(suggestion)은 ko, en, ja 키를 가진 객체로 작성해야 하며, 각 언어에 맞는 법률 용어를 사용하여 번역하라."
{
  "violation": false,
  "law_reference": "관련 법 조항 또는 '해당 없음' (Relevant Law Article or 'N/A')",
  "explanation": {
    "ko": "한국어 판단 근거 (전체 맥락 고려)",
    "en": "Judgement basis in English (Considering overall context)",
    "ja": "日本語での判断根拠 (全体적인 문맥 고려)"
  },
  "severity": "SAFE",
  "suggestion": {
    "ko": "한국어 수정 제안 (없으면 '해당 없음')",
    "en": "Modification suggestion in English (If none, 'N/A')",
    "ja": "日本語での修正提案 (なければ '該当なし')"
  }
}
"""

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

        # JSON 파싱 (안전 처리)
        try:
            if text.startswith("```json"): text = text[7:]
            if text.endswith("```"): text = text[:-3]
            text = text.strip()
            result = json.loads(text, strict=False)
        except json.JSONDecodeError:
            # 파싱 실패 시 강제 추출 시도
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                result = json.loads(text[start:end + 1], strict=False)
            else:
                raise ValueError("JSON 파싱 실패")

        # 등급 보정 로직
        sev = result.get("severity", "SAFE").upper()
        if sev in ["HIGH", "CRITICAL"]:
            result["severity"] = "CRITICAL"
        elif sev in ["MEDIUM", "WARNING"]:
            result["severity"] = "WARNING"
        elif sev in ["LOW", "DISADVANTAGE"]:
            result["severity"] = "DISADVANTAGE"
        elif sev == "SAFE":
            result["severity"] = "SAFE"
        else:
            result["severity"] = "DISADVANTAGE"

        return result

    except Exception as e:
        print(f"[ERROR] 단일 분석 에러: {str(e)}")
        return {"severity": "DISADVANTAGE", "explanation": "분석 중 오류 발생"}
