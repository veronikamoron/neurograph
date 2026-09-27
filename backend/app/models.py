from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class QueryRequest(BaseModel):
    question: str
    max_hops: int = 2

class QueryResponse(BaseModel):
    answer: str
    graph_path: Dict[str, Any]
    sources: List[str]
    metrics: Dict[str, Any]

class GraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    links: List[Dict[str, Any]]

class GraphStats(BaseModel):
    total_nodes: int
    total_edges: int
    by_type: Dict[str, int]

class HealthResponse(BaseModel):
    status: str
    version: str

class DocumentInfo(BaseModel):
    id: str
    title: str
    content: str
