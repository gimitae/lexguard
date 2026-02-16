# backend/utils/llm_service.py
import os
import json
from dotenv import load_dotenv  # 추가
from openai import OpenAI
from prompts.analysis_prompt import SYSTEM_PROMPT

load_dotenv()  # 추가

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_batch_analysis_prompt(clauses: list, related_laws_per_clause: list):
    """
    일괄 분석용 프롬프트 생성
    """
    prompt = """다음은 근로계약서의 조항들입니다. 각 조항을 분석하고 JSON 배열로 응답해주세요.

## 분석할 조항들:

"""

    for i, clause in enumerate(clauses):
        related_laws = related_laws_per_clause[i] if i < len(related_laws_per_clause) else []

        prompt += f"\n### 조항 {i + 1}:\n"
        prompt += f"[계약 조항]\n{clause}\n"

        if related_laws:
            prompt += f"\n[관련 법률]\n"
            for law in related_laws[:3]:
                if isinstance(law, dict):
                    prompt += f"[{law.get('article_id', 'N/A')}] {law.get('title', '')}\n{law.get('content', '')}\n\n"
                else:
                    prompt += f"- {law}\n"
        else:
            prompt += "\n[관련 법률]\n관련 법률 없음\n"

    prompt += """

## 응답 형식:
다음 JSON 형식으로 **각 조항마다** 분석 결과를 작성해주세요:

{
  "results": [
    {
      "clause_number": 1,
      "violation": true,
      "law_reference": "근로기준법 제50조",
      "explanation": "법률 근거에 기반한 분석 설명",
      "severity": "HIGH"
    },
    {
      "clause_number": 2,
      "violation": false,
      "law_reference": "근거 부족",
      "explanation": "제공된 법률에 명시적 근거 없음",
      "severity": "NONE"
    }
  ]
}

**중요 규칙:**
1. 제공된 [관련 법률] 텍스트에 없는 법률을 인용하지 말 것
2. 법률에 명시적 근거가 없는 경우 '근거 부족'이라고 판단할 것
3. 절대 추측하지 말 것
4. 법률 조항 번호(article_id)를 그대로 인용할 것
5. JSON 외 텍스트 출력 금지 (마크다운 코드블록 포함 금지)
6. severity 기준:
   - HIGH: 명백한 법 위반
   - MEDIUM: 위반 가능성 높음
   - LOW: 해석상 문제 가능성
   - NONE: 위반 아님 또는 근거 부족
7. clause_number는 1부터 시작
8. 모든 조항을 빠짐없이 분석
"""

    return prompt


def analyze_all_clauses_batch(clauses: list, related_laws_per_clause: list):
    """
    모든 조항을 한 번에 GPT에게 분석 요청
    """
    print(f"\n{'=' * 60}")
    print(f"[DEBUG] 일괄 분석 시작")
    print(f"[DEBUG] 총 조항 수: {len(clauses)}")

    # 프롬프트 구성
    prompt = build_batch_analysis_prompt(clauses, related_laws_per_clause)

    if not prompt:
        print("[ERROR] 프롬프트 생성 실패")
        return []

    print(f"[DEBUG] 프롬프트 길이: {len(prompt)} 글자")

    try:
        print("[DEBUG] OpenAI API 호출 중...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=2000
        )

        text = response.choices[0].message.content.strip()
        print(f"[SUCCESS] GPT 응답 받음 ({len(text)} 글자)")
        print(f"[DEBUG] 응답 내용:\n{text[:500]}...\n")

        # 마크다운 코드블록 제거
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        try:
            parsed = json.loads(text)
            print(f"[SUCCESS] JSON 파싱 성공")

            if "results" in parsed and isinstance(parsed["results"], list):
                results = parsed["results"]
                print(f"[DEBUG] 분석 결과: {len(results)}개")

                # clause_number 검증 및 보정
                for i, result in enumerate(results):
                    if "clause_number" not in result:
                        result["clause_number"] = i + 1
                        print(f"[WARNING] 조항 {i + 1} clause_number 누락 - 자동 추가")

                    # 필수 필드 검증
                    if "violation" not in result:
                        result["violation"] = False
                    if "law_reference" not in result:
                        result["law_reference"] = "근거 부족"
                    if "explanation" not in result:
                        result["explanation"] = "분석 정보 없음"
                    if "severity" not in result:
                        result["severity"] = "NONE"

                return results
            else:
                print("[WARNING] 'results' 키가 없거나 리스트가 아님")
                print(f"[DEBUG] 파싱된 구조: {parsed}")
                return []

        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON 파싱 실패: {str(e)}")
            print(f"[DEBUG] 파싱 시도한 텍스트:\n{text}\n")
            return []

    except Exception as e:
        print(f"[ERROR] OpenAI API 에러: {type(e).__name__}")
        print(f"[ERROR] 메시지: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def analyze_clause(clause: str, related_laws: list):
    """
    단일 조항 분석 (레거시 함수)
    """
    from backend.prompts.analysis_prompt import build_analysis_prompt

    print(f"\n[DEBUG] 단일 조항 분석")
    print(f"[DEBUG] 조항: {clause[:100]}...")

    prompt = build_analysis_prompt(clause, related_laws)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        text = response.choices[0].message.content.strip()
        print(f"[SUCCESS] GPT 응답: {text[:200]}...")

        # 마크다운 제거
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        try:
            parsed = json.loads(text)
            return parsed
        except json.JSONDecodeError as e:
            print(f"[WARNING] JSON 파싱 실패: {str(e)}")
            return {
                "violation": False,
                "law_reference": "근거 부족",
                "explanation": text,
                "severity": "NONE"
            }

    except Exception as e:
        print(f"[ERROR] API 에러: {str(e)}")
        return {
            "violation": False,
            "law_reference": "근거 부족",
            "explanation": f"분석 실패: {str(e)}",
            "severity": "NONE"
        }