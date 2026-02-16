# services/rag_retriever.py

from .embedding_service import get_embedding  # 수정 (같은 폴더)
from .vector_store import vector_store  # 수정 (같은 폴더)

def retrieve_related_laws(clause: str):

    query_embedding = get_embedding(clause)
    related_laws = vector_store.search(query_embedding, top_k=3)

    return related_laws