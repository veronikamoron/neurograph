from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_graph():
    response = client.get("/api/graph")
    assert response.status_code == 200

def test_get_stats():
    response = client.get("/api/graph/stats")
    assert response.status_code == 200

def test_get_documents():
    response = client.get("/api/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_query_without_key_returns_error():
    response = client.post("/api/query", json={"question": "test"})
    assert response.status_code == 401
