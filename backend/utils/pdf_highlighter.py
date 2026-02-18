# utils/pdf_highlighter.py

import fitz  # PyMuPDF
import io
from typing import List, Dict


def highlight_pdf(original_pdf_bytes: bytes, analysis_results: List[Dict]) -> bytes:
    """
    PDF에 분석 결과에 따라 색상 하이라이트 추가

    Args:
        original_pdf_bytes: 원본 PDF 파일 바이트
        analysis_results: 분석 결과 리스트

    Returns:
        하이라이트가 추가된 PDF 바이트
    """
    print("\n[DEBUG] PDF 하이라이트 시작")

    try:
        # PDF 열기
        pdf_document = fitz.open(stream=original_pdf_bytes, filetype="pdf")

        # Severity별 색상 정의
        color_map = {
            "CRITICAL": (1, 0, 0),  # 빨간색
            "HIGH": (1, 0.2, 0.2),  # 진한 빨간색
            "MEDIUM": (1, 1, 0),  # 노란색
            "LOW": (0.5, 1, 0.5),  # 연두색
            "NONE": (0, 1, 0)  # 초록색
        }

        # 각 분석 결과에 대해 하이라이트 추가
        for result in analysis_results:
            clause_text = result.get("clause", "").strip()
            severity = result.get("severity", "NONE")

            if not clause_text or severity == "NONE":
                continue  # 안전한 조항은 하이라이트 안함

            print(f"[DEBUG] 하이라이트: {severity} - {clause_text[:50]}...")

            # PDF에서 해당 텍스트 검색
            color = color_map.get(severity, (0, 1, 0))

            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]

                # 텍스트 검색 (첫 20자만 사용하여 매칭)
                search_text = clause_text[:50].strip()
                text_instances = page.search_for(search_text)

                # 하이라이트 추가
                for inst in text_instances:
                    highlight = page.add_highlight_annot(inst)
                    highlight.set_colors(stroke=color)
                    highlight.update()

        # 메모리에 저장
        output_bytes = pdf_document.write()
        pdf_document.close()

        print("[SUCCESS] PDF 하이라이트 완료")
        return output_bytes

    except Exception as e:
        print(f"[ERROR] PDF 하이라이트 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return original_pdf_bytes  # 실패시 원본 반환


def create_highlighted_pdf_with_text(
        original_text: str,
        analysis_results: List[Dict],
        page_width: int = 595,
        page_height: int = 842
) -> bytes:
    """
    텍스트로부터 새로운 PDF를 생성하고 하이라이트 추가
    (원본 PDF가 없을 때 사용)

    Args:
        original_text: 추출된 텍스트
        analysis_results: 분석 결과
        page_width: 페이지 너비 (A4: 595)
        page_height: 페이지 높이 (A4: 842)

    Returns:
        생성된 PDF 바이트
    """
    print("\n[DEBUG] 텍스트로부터 PDF 생성 및 하이라이트")

    try:
        # 새 PDF 생성
        pdf = fitz.open()

        # 페이지 추가
        page = pdf.new_page(width=page_width, height=page_height)

        # Severity별 배경색 정의
        color_map = {
            "CRITICAL": (1, 0.9, 0.9),  # 연한 빨간색 배경
            "HIGH": (1, 0.95, 0.95),  # 매우 연한 빨간색
            "MEDIUM": (1, 1, 0.9),  # 연한 노란색
            "LOW": (0.95, 1, 0.95),  # 연한 초록색
            "NONE": (1, 1, 1)  # 흰색 (변경 없음)
        }

        # 텍스트 삽입 위치
        y_position = 50
        line_height = 20
        margin = 50

        # 각 조항을 페이지에 추가
        for result in analysis_results:
            clause_text = result.get("clause", "").strip()
            severity = result.get("severity", "NONE")

            if not clause_text:
                continue

            # 페이지가 꽉 찼으면 새 페이지 추가
            if y_position > page_height - 100:
                page = pdf.new_page(width=page_width, height=page_height)
                y_position = 50

            # 배경색 적용
            bg_color = color_map.get(severity, (1, 1, 1))

            # 텍스트 박스 그리기
            rect = fitz.Rect(margin, y_position - 5, page_width - margin, y_position + line_height)

            if severity != "NONE":
                page.draw_rect(rect, color=None, fill=bg_color)

            # 텍스트 삽입 (한글 폰트 적용)
            # macOS 시스템 폰트 경로 시도
            font_path = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
            if not os.path.exists(font_path):
                font_path = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
            
            font_name = "ko-font"
            if os.path.exists(font_path):
                page.insert_text(
                    (margin + 5, y_position + 12),
                    clause_text[:100],
                    fontsize=10,
                    fontname=font_name,
                    fontfile=font_path,
                    color=(0, 0, 0)
                )
            else:
                # 폰트가 없을 경우 기본 폰트로 시도 (깨질 수 있음)
                page.insert_text(
                    (margin + 5, y_position + 12),
                    clause_text[:100],
                    fontsize=10,
                    color=(0, 0, 0)
                )

            y_position += line_height + 10

        # PDF 저장
        output_bytes = pdf.write()
        pdf.close()

        print("[SUCCESS] PDF 생성 및 하이라이트 완료")
        return output_bytes

    except Exception as e:
        print(f"[ERROR] PDF 생성 실패: {str(e)}")
        import traceback
        traceback.print_exc()
        return b""