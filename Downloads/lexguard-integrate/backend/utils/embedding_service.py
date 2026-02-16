# services/embedding_service.py

import os
from dotenv import load_dotenv  # 추가
from openai import OpenAI

# 이 파일에서도 .env 로드
load_dotenv()  # 추가

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embedding(text: str):
    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding