# services/ocr_service.py
from paddleocr import PaddleOCR
import numpy as np
import cv2

OCR_MODELS = {}

LANG_MAP = {
    "ko": "korean",
    "en": "english",
    "jp": "japan",
    "cn": "ch",
    "vi": "vietnam",
    "th": "thai"
}


def get_ocr(lang_code: str):
    if lang_code not in OCR_MODELS:
        paddle_lang = LANG_MAP.get(lang_code, "korean")
        print(f"[DEBUG] PaddleOCR 초기화: {paddle_lang}")
        OCR_MODELS[lang_code] = PaddleOCR(
            lang=paddle_lang,
            use_angle_cls=True,
            show_log=False
        )
    return OCR_MODELS[lang_code]


async def run_ocr(upload_file, lang_code="ko") -> str:
    print(f"\n[DEBUG] OCR 시작 - 언어: {lang_code}")

    try:
        contents = await upload_file.read()
        print(f"[DEBUG] 파일 읽기 완료: {len(contents)} bytes")

        np_img = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            print("[ERROR] 이미지 디코딩 실패")
            return ""

        print(f"[DEBUG] 이미지 크기: {img.shape}")

        ocr = get_ocr(lang_code)
        result = ocr.ocr(img)

        print(f"[DEBUG] OCR 결과 타입: {type(result)}")
        print(f"[DEBUG] OCR 결과 길이: {len(result) if result else 0}")

        if not result or result[0] is None:
            print("[WARNING] OCR 결과 없음 (텍스트 미검출)")
            return ""

        texts = []
        for page_idx, page in enumerate(result):
            if page is None:
                print(f"[WARNING] Page {page_idx} is None")
                continue

            print(f"[DEBUG] Page {page_idx}: {len(page)} 라인")

            for line_idx, line in enumerate(page):
                if line and len(line) > 1 and line[1]:
                    text = line[1][0]
                    confidence = line[1][1]
                    texts.append(text)
                    if line_idx < 3:  # 처음 3줄만 출력
                        print(f"[DEBUG]   Line {line_idx}: {text[:50]} (confidence: {confidence:.2f})")

        extracted_text = "\n".join(texts)
        print(f"[SUCCESS] OCR 완료: {len(extracted_text)} 글자 추출")
        print(f"[DEBUG] 추출 텍스트 미리보기:\n{extracted_text[:300]}\n")

        return extracted_text

    except Exception as e:
        print(f"[ERROR] OCR 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""