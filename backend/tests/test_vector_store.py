import pytest
from app.rag.vector_store import NeuroscienceVectorStore
import os

@pytest.fixture
def store(tmp_path):
    return NeuroscienceVectorStore(persist_dir=str(tmp_path))

def test_add_and_search(store):
    docs = [{"id": "1", "title": "Test", "content": "This is a test doc."}]
    store.add_documents(docs)
    res = store.search("test")
    assert len(res) > 0
    assert res[0]['doc_id'] == "1"

def test_search_relevance(store):
    docs = [
        {"id": "1", "title": "Brain", "content": "The brain is cool."},
        {"id": "2", "title": "Car", "content": "Cars go fast."}
    ]
    store.add_documents(docs)
    res = store.search("brain", k=1)
    assert res[0]['doc_id'] == "1"
