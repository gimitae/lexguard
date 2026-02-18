# services/analyze_contract.py
import re


def split_clauses(contract_text: str):
    """
    계약서 텍스트를 조항별로 분리하며 위치(start, end) 정보를 함께 반환
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
            clause_text = contract_text[start:end] # strip() 제거
            if len(clause_text) > 5:
                clauses.append({
                    "text": clause_text,
                    "start": start,
                    "end": end
                })
        return clauses

    # 방법 2: 줄바꿈 기준 분리
    print("[DEBUG] '제N조' 패턴 없음 - 줄바꿈 기준 분리")
    clauses = []
    lines = contract_text.split("\n")
    current_pos = 0
    for line in lines:
        line_text = line # strip() 제거
        start = contract_text.find(line, current_pos)
        end = start + len(line)
        if len(line_text) > 5:
            clauses.append({
                "text": line_text,
                "start": start,
                "end": end
            })
        current_pos = end
    
    # 방법 3: 그래도 없으면 전체를 하나의 조항으로
    if not clauses:
        print("[DEBUG] 분리 불가 - 전체 텍스트를 단일 조항으로 처리")
        return [{
            "text": contract_text, # strip() 제거
            "start": 0,
            "end": len(contract_text)
        }] if contract_text.strip() else []

    return clauses