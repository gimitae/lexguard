# services/vector_store.py

import json
import numpy as np
from .embedding_service import get_embedding  # 수정: backend.utils → .


class VectorStore:

    def __init__(self):
        self.vectors = []
        self.metadata = []
        self.loaded = False

    def load_law_data(self):
        if self.loaded:
            return

        with open("data/labor_law_articles.json", "r", encoding="utf-8") as f:
            laws = json.load(f)

        for law in laws:
            embedding = get_embedding(law["content"])
            self.vectors.append(np.array(embedding))
            self.metadata.append(law)

        self.loaded = True

    def search(self, query_embedding, top_k=3):
        if not self.loaded:
            self.load_law_data()

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