# services/rag_retriever.py

from services.embedding_service import get_embedding
from services.vector_store import vector_store

def retrieve_related_laws(clause: str):

    query_embedding = get_embedding(clause)
    related_laws = vector_store.search(query_embedding, top_k=3)

    return related_laws