import io
from PyPDF2 import PdfReader
from docx import Document

def parse_document(content: bytes, filename: str) -> str:
    """
    PDF 또는 DOCX 파일에서 텍스트 추출
    
    Args:
        content: 파일 바이트
        filename: 파일명
    
    Returns:
        추출된 텍스트
    """
    file_extension = filename.lower().split('.')[-1]
    
    try:
        if file_extension == 'pdf':
            return parse_pdf(content)
        elif file_extension in ['docx', 'doc']:
            return parse_docx(content)
        else:
            raise ValueError(f"지원하지 않는 파일 형식: {file_extension}")
    except Exception as e:
        raise Exception(f"파일 파싱 실패: {str(e)}")

def parse_pdf(content: bytes) -> str:
    """PDF 파일에서 텍스트 추출"""
    pdf_file = io.BytesIO(content)
    pdf_reader = PdfReader(pdf_file)
    
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    
    return text.strip()

def parse_docx(content: bytes) -> str:
    """DOCX 파일에서 텍스트 추출"""
    docx_file = io.BytesIO(content)
    doc = Document(docx_file)
    
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    
    return text.strip()