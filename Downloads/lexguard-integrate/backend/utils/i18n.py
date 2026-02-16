import json
from pathlib import Path

TRANSLATIONS_DIR = Path(__file__).parent.parent / "translations"

def load_lang(lang_code="ko"):
    file_path = TRANSLATIONS_DIR / f"{lang_code}.json"
    if not file_path.exists():
        file_path = TRANSLATIONS_DIR / "ko.json"
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)