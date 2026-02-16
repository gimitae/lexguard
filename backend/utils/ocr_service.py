# services/ocr_service.py
from paddleocr import PaddleOCR
import numpy as np
import cv2
import io
from PIL import Image

# PDF 처리용
try:
    import fitz  # PyMuPDF

    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False

# DOCX 처리용
try:
    from docx import Document

    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

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
    print(f"[DEBUG] 파일명: {upload_file.filename}")
    print(f"[DEBUG] Content-Type: {upload_file.content_type}")

    try:
        contents = await upload_file.read()
        print(f"[DEBUG] 파일 읽기 완료: {len(contents)} bytes")

        # 파일 타입 확인
        filename = upload_file.filename.lower()

        # PDF 처리
        if filename.endswith('.pdf'):
            return await process_pdf(contents, lang_code)

        # DOCX 처리
        elif filename.endswith('.docx'):
            return await process_docx(contents)

        # 이미지 처리 (PNG, JPG, JPEG)
        else:
            return await process_image(contents, lang_code)

    except Exception as e:
        print(f"[ERROR] OCR 에러: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""


async def process_image(contents: bytes, lang_code: str) -> str:
    """이미지 파일 OCR 처리"""
    print("[DEBUG] 이미지 파일 처리")

    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if img is None:
        print("[ERROR] 이미지 디코딩 실패")
        return ""

    print(f"[DEBUG] 이미지 크기: {img.shape}")

    ocr = get_ocr(lang_code)
    result = ocr.ocr(img)

    return extract_text_from_ocr_result(result)


async def process_pdf(contents: bytes, lang_code: str) -> str:
    """PDF 파일 OCR 처리"""
    print("[DEBUG] PDF 파일 처리")

    if not HAS_FITZ:
        print("[ERROR] PyMuPDF가 설치되지 않음")
        return ""

    try:
        # PDF를 이미지로 변환
        pdf_document = fitz.open(stream=contents, filetype="pdf")
        ocr = get_ocr(lang_code)
        all_texts = []

        for page_num in range(len(pdf_document)):
            print(f"[DEBUG] PDF 페이지 {page_num + 1}/{len(pdf_document)} 처리 중")
            page = pdf_document[page_num]

            # 페이지를 이미지로 렌더링
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2배 확대
            img_data = pix.tobytes("png")

            # OCR 처리
            np_img = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

            result = ocr.ocr(img)
            page_text = extract_text_from_ocr_result(result)
            all_texts.append(page_text)

        pdf_document.close()
        return "\n\n".join(all_texts)

    except Exception as e:
        print(f"[ERROR] PDF 처리 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""


async def process_docx(contents: bytes) -> str:
    """DOCX 파일 텍스트 추출 (OCR 불필요)"""
    print("[DEBUG] DOCX 파일 처리")

    if not HAS_DOCX:
        print("[ERROR] python-docx가 설치되지 않음")
        return ""

    try:
        doc = Document(io.BytesIO(contents))
        texts = []

        for para in doc.paragraphs:
            if para.text.strip():
                texts.append(para.text.strip())

        extracted_text = "\n".join(texts)
        print(f"[SUCCESS] DOCX 처리 완료: {len(extracted_text)} 글자 추출")
        return extracted_text

    except Exception as e:
        print(f"[ERROR] DOCX 처리 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""


def extract_text_from_ocr_result(result) -> str:
    """OCR 결과에서 텍스트 추출"""
    if not result or result[0] is None:
        print("[WARNING] OCR 결과 없음")
        return ""

    texts = []
    for page_idx, page in enumerate(result):
        if page is None:
            continue

        for line in page:
            if line and len(line) > 1 and line[1]:
                text = line[1][0]
                texts.append(text)

    extracted_text = "\n".join(texts)
    print(f"[SUCCESS] OCR 완료: {len(extracted_text)} 글자 추출")
    return extracted_text