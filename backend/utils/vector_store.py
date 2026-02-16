import json
import numpy as np
import os
from .embedding_service import get_embedding


class VectorStore:

    def __init__(self):
        self.vectors = []
        self.metadata = []
        self.loaded = False

    def load_law_data(self):
        if self.loaded:
            return

        file_path = "data/labor_law_articles.json"

        # 파일이 없으면 자동 생성
        if not os.path.exists(file_path):
            print(f"[WARNING] {file_path} 파일이 없습니다. 빈 파일 생성중...")
            os.makedirs("data", exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"[INFO] 빈 법률 데이터 파일 생성 완료")
            self.loaded = True
            return

        with open(file_path, "r", encoding="utf-8") as f:
            laws = json.load(f)

        if not laws:
            print("[WARNING] 법률 데이터가 비어있습니다.")
            self.loaded = True
            return

        for law in laws:
            embedding = get_embedding(law["content"])
            self.vectors.append(np.array(embedding))
            self.metadata.append(law)

        self.loaded = True
        print(f"[INFO] {len(laws)}개 법률 데이터 로드 완료")

    def search(self, query_embedding, top_k=3):
        if not self.loaded:
            self.load_law_data()

        if not self.vectors:
            print("[WARNING] 검색할 법률 데이터가 없습니다.")
            return []

        sims = []

        for idx, vec in enumerate(self.vectors):
            similarity = np.dot(query_embedding, vec)
            sims.append((similarity, idx))

        sims.sort(reverse=True)

        results = []
        for _, idx in sims[:top_k]:
            results.append(self.metadata[idx])

        return results


vector_store = VectorStore()