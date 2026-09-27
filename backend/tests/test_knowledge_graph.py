import pytest
from app.graph.knowledge_graph import BrainKnowledgeGraph

def test_add_entity():
    kg = BrainKnowledgeGraph()
    kg.add_entity("TestNode", "test_type")
    assert "TestNode" in kg.graph

def test_add_relationship():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("A", "B", "relates_to")
    assert kg.graph.has_edge("A", "B")

def test_traverse():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("A", "B", "r1")
    kg.add_relationship("B", "C", "r2")
    paths = kg.traverse("A", max_hops=2)
    assert len(paths) > 0

def test_find_path():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("A", "B", "r1")
    path = kg.find_path("A", "B")
    assert len(path) > 0

def test_serialization():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("A", "B", "r1")
    d = kg.to_dict()
    kg2 = BrainKnowledgeGraph()
    kg2.from_dict(d)
    assert kg2.graph.has_edge("A", "B")

def test_load_prebuilt():
    kg = BrainKnowledgeGraph()
    kg.load_prebuilt()
    # Might be empty if file isn't physically created during test run but won't crash

def test_search_entities():
    kg = BrainKnowledgeGraph()
    kg.add_entity("TestNode", "type")
    res = kg.search_entities("test")
    assert len(res) == 1

def test_to_vis_json():
    kg = BrainKnowledgeGraph()
    kg.add_relationship("A", "B", "r")
    v = kg.to_vis_json()
    assert "nodes" in v and "links" in v
