# services/vector_store.py

import json
import numpy as np
from services.embedding_service import get_embedding

class VectorStore:

    def __init__(self):
        self.vectors = []
        self.metadata = []

    def load_law_data(self):
        with open("data/labor_law_articles.json", "r", encoding="utf-8") as f:
            laws = json.load(f)

        for law in laws:
            embedding = get_embedding(law["content"])
            self.vectors.append(np.array(embedding))
            self.metadata.append(law)

    def search(self, query_embedding, top_k=3):
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
vector_store.load_law_data()