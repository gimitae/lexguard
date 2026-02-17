# services/analyze_contract.py
import re


def split_clauses(contract_text: str):
    """
    계약서 텍스트를 조항별로 분리
    - 제N조, 제N항 패턴 우선 감지
    - 없으면 줄바꿈 기준으로 분리
    - 최소 길이 제한 완화 (5글자 이상)
    """
    # 방법 1: 제N조 패턴으로 분리
    article_pattern = r'제\s*\d+\s*조'
    matches = list(re.finditer(article_pattern, contract_text))

    if len(matches) > 1:
        print(f"[DEBUG] '제N조' 패턴 {len(matches)}개 발견")
        clauses = []
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(contract_text)
            clause = contract_text[start:end].strip()
            if len(clause) > 5:
                clauses.append(clause)
        return clauses

    # 방법 2: 줄바꿈 기준 분리 (최소 길이 완화)
    print("[DEBUG] '제N조' 패턴 없음 - 줄바꿈 기준 분리")
    clauses = [c.strip() for c in contract_text.split("\n") if len(c.strip()) > 5]

    # 방법 3: 그래도 없으면 전체를 하나의 조항으로
    if not clauses:
        print("[DEBUG] 분리 불가 - 전체 텍스트를 단일 조항으로 처리")
        return [contract_text.strip()] if contract_text.strip() else []

    return clauses