import pytest
from app.rag.graph_rag import GraphRAGEngine
from app.graph.knowledge_graph import BrainKnowledgeGraph

class MockVectorStore:
    def search(self, query, k=5):
        return [{"content": "mock doc"}]

class MockProvider:
    def generate(self, prompt, api_key):
        return "mock answer"

@pytest.fixture
def rag_engine():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("Brain", "Mind", "creates")
    return GraphRAGEngine(kg, MockVectorStore(), MockProvider())

def test_extract_question_entities(rag_engine):
    entities = rag_engine._extract_question_entities("How does the brain work?")
    assert "Brain" in [e.lower() for e in entities] or "Brain" in entities

def test_graph_retrieval(rag_engine):
    ctx, paths = rag_engine._graph_retrieval(["Brain"], 2)
    assert len(paths) > 0

def test_vector_retrieval(rag_engine):
    res = rag_engine._vector_retrieval("q")
    assert len(res) == 1

def test_merge_context(rag_engine):
    ctx = rag_engine._merge_context([{"content": "g"}], [{"content": "v"}])
    assert "g" in ctx and "v" in ctx

def test_full_query(rag_engine):
    res = rag_engine.query("Brain", "fake_key")
    assert res["answer"] == "mock answer"
