import io
import os
import cv2
import numpy as np
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='korean')


async def run_ocr(file, lang_code='ko') -> str:
    """
    파일 타입에 따라 텍스트 추출
    지원: PDF, DOCX, HWP, PNG, JPG, JPEG, WEBP, BMP, TIFF
    """
    filename = file.filename.lower()
    content = await file.read()

    try:
        if filename.endswith('.pdf'):
            return extract_from_pdf(content)

        elif filename.endswith('.docx'):
            return extract_from_docx(content)

        elif filename.endswith('.hwp'):
            return extract_from_hwp(content)

        elif filename.endswith('.hwpx'):
            return extract_from_hwpx(content)

        elif filename.split('.')[-1] in ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif']:
            return extract_from_image(content)

        else:
            raise ValueError(f"지원하지 않는 파일 형식: {filename}")

    except Exception as e:
        print(f"[ERROR] OCR 실패: {str(e)}")
        raise


def extract_from_pdf(content: bytes) -> str:
    """PDF에서 텍스트 추출"""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        texts = []

        for page_num in range(len(doc)):
            page = doc[page_num]

            # 1. 텍스트 레이어 먼저 시도
            text = page.get_text()
            if text.strip():
                texts.append(text)
                continue

            # 2. 텍스트가 없으면 OCR
            print(f"[INFO] PDF 페이지 {page_num + 1}: 텍스트 없음, OCR 수행")
            mat = fitz.Matrix(2, 2)  # 해상도 2배
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")

            ocr_text = run_ocr_on_image_bytes(img_data)
            if ocr_text:
                texts.append(ocr_text)

        doc.close()
        return '\n'.join(texts)

    except Exception as e:
        print(f"[ERROR] PDF 추출 실패: {str(e)}")
        raise


def extract_from_docx(content: bytes) -> str:
    """DOCX에서 텍스트 추출"""
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        # 필터링 없이 모든 단락을 포함하여 원본 서식(줄바꿈 등) 유지
        texts = [para.text for para in doc.paragraphs]
        return '\n'.join(texts)

    except Exception as e:
        print(f"[ERROR] DOCX 추출 실패: {str(e)}")
        raise


def extract_from_hwp(content: bytes) -> str:
    """HWP 파일에서 텍스트 추출"""
    try:
        # 방법 1: olefile로 파싱
        import olefile
        import zlib

        if not olefile.isOleFile(io.BytesIO(content)):
            raise ValueError("유효하지 않은 HWP 파일입니다.")

        ole = olefile.OleFileIO(io.BytesIO(content))
        texts = []

        # BodyText 섹션에서 텍스트 추출
        if ole.exists('BodyText'):
            body_dir = ole.listdir()
            sections = [s for s in body_dir if len(s) > 1 and s[0] == 'BodyText']
            sections.sort()

            for section in sections:
                try:
                    section_path = '/'.join(section)
                    data = ole.openstream(section_path).read()

                    # 압축 해제 시도
                    try:
                        decompressed = zlib.decompress(data, -15)
                    except:
                        decompressed = data

                    # 텍스트 레코드 파싱
                    text = parse_hwp_text(decompressed)
                    if text:
                        texts.append(text)

                except Exception as e:
                    print(f"[WARNING] HWP 섹션 파싱 실패: {str(e)}")
                    continue

        ole.close()

        result = '\n'.join(texts)

        if not result.strip():
            # 방법 2: 바이너리에서 한글 텍스트 직접 추출
            result = extract_text_from_binary(content)

        return result

    except ImportError:
        print("[WARNING] olefile 없음. 바이너리 추출 시도")
        return extract_text_from_binary(content)

    except Exception as e:
        print(f"[ERROR] HWP 추출 실패: {str(e)}")
        raise


def parse_hwp_text(data: bytes) -> str:
    """HWP 바이너리 레코드에서 텍스트 파싱"""
    texts = []
    i = 0

    while i < len(data) - 4:
        try:
            # 레코드 헤더 파싱 (4바이트)
            header = int.from_bytes(data[i:i+4], 'little')
            tag_id = header & 0x3FF
            level = (header >> 10) & 0x3FF
            size = (header >> 20) & 0xFFF

            if size == 0xFFF:
                if i + 8 > len(data):
                    break
                size = int.from_bytes(data[i+4:i+8], 'little')
                i += 8
            else:
                i += 4

            if i + size > len(data):
                break

            # 태그 67 = 파라그래프 텍스트
            if tag_id == 67:
                try:
                    text = data[i:i+size].decode('utf-16-le', errors='ignore')
                    text = text.replace('\x00', '') # strip() 제거
                    if text:
                        texts.append(text)
                except:
                    pass

            i += size

        except Exception:
            i += 1

    return '\n'.join(texts)


def extract_text_from_binary(content: bytes) -> str:
    """바이너리에서 한글/영문 텍스트 직접 추출 (fallback)"""
    try:
        # UTF-16-LE 디코딩 시도
        text = content.decode('utf-16-le', errors='ignore')
        # 제어문자 제거 (필수적인 것만)
        import re
        text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
        return text # 과도한 split/join 제거
    except:
        return ""


def extract_from_hwpx(content: bytes) -> str:
    """HWPX(ZIP 기반) 파일에서 텍스트 추출"""
    try:
        import zipfile
        from xml.etree import ElementTree as ET

        texts = []

        with zipfile.ZipFile(io.BytesIO(content)) as z:
            # Contents/section*.xml 파일들 찾기
            section_files = sorted([
                name for name in z.namelist()
                if name.startswith('Contents/section') and name.endswith('.xml')
            ])

            for section_file in section_files:
                xml_content = z.read(section_file)
                root = ET.fromstring(xml_content)

                # 모든 텍스트 노드 추출
                for elem in root.iter():
                    if elem.text and elem.text.strip():
                        texts.append(elem.text.strip())

        return '\n'.join(texts)

    except Exception as e:
        print(f"[ERROR] HWPX 추출 실패: {str(e)}")
        raise


def extract_from_image(content: bytes) -> str:
    """이미지에서 OCR로 텍스트 추출"""
    return run_ocr_on_image_bytes(content)


def run_ocr_on_image_bytes(image_bytes: bytes) -> str:
    """이미지 바이트에서 OCR 수행"""
    try:
        # 이미지 디코딩
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            # PIL로 재시도
            from PIL import Image
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img = pil_img.convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        if img is None:
            raise ValueError("이미지 디코딩 실패")

        # 이미지 전처리 (스캔 이미지 품질 향상)
        img = preprocess_image(img)

        # OCR 수행
        result = ocr.ocr(img)

        if not result or not result[0]:
            return ""

        texts = []
        for line in result[0]:
            try:
                text = line[1][0]
                conf = line[1][1]
                if conf > 0.4:
                    texts.append(text)
            except: continue

        return '\n'.join(texts)

    except Exception as e:
        print(f"[ERROR] 이미지 OCR 실패: {str(e)}")
        raise


def preprocess_image(img):
    """스캔 이미지 전처리 (노이즈 제거, 대비 향상)"""
    try:
        # 그레이스케일 변환
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 노이즈 제거
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # 적응형 이진화 (스마트폰 촬영 이미지에 효과적)
        binary = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )

        # 다시 컬러로 변환
        result = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
        return result

    except Exception:
        return img