import json

def safe_parse_llm_output(output_text: str):
    try:
        data = json.loads(output_text)

        required_keys = ["violation", "law_reference", "explanation", "severity"]

        for key in required_keys:
            if key not in data:
                raise ValueError(f"Missing key: {key}")

        return data

    except Exception:
        return {
            "violation": False,
            "law_reference": "파싱 오류",
            "explanation": "LLM 출력이 JSON 형식을 따르지 않음",
            "severity": "NONE"
        }