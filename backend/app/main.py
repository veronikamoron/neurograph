from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.models import QueryRequest, QueryResponse, GraphData, GraphStats, HealthResponse, DocumentInfo
from app.graph.knowledge_graph import BrainKnowledgeGraph
from app.rag.vector_store import NeuroscienceVectorStore
from app.rag.llm_provider import GeminiProvider
from app.rag.graph_rag import GraphRAGEngine
from app.config import settings
import os

app = FastAPI(title="NeuroGraph API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

knowledge_graph = BrainKnowledgeGraph()
vector_store = NeuroscienceVectorStore(persist_dir=settings.CHROMA_PERSIST_DIR)
llm_provider = GeminiProvider()
rag_engine = GraphRAGEngine(knowledge_graph, vector_store, llm_provider)

# Resolve frontend directory
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")

@app.on_event("startup")
async def startup_event():
    knowledge_graph.load_prebuilt()
    vector_store.initialize_from_sample_data()

# --- API Routes ---

@app.get("/api/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", version="1.0.0")

@app.get("/api/graph")
async def get_graph():
    return knowledge_graph.to_vis_json()

@app.get("/api/graph/stats", response_model=GraphStats)
async def get_stats():
    return knowledge_graph.get_statistics()

@app.get("/api/documents", response_model=list[DocumentInfo])
async def get_documents():
    from app.data.sample_documents import DOCUMENTS
    return DOCUMENTS

@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest, x_api_key: str = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API Key required. Please set your Gemini API key in the dashboard.")
    try:
        result = rag_engine.query(request.question, x_api_key, max_hops=request.max_hops)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/graph/build")
async def build_graph(x_api_key: str = Header(None)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API Key required")
    from app.graph.entity_extractor import EntityExtractor
    from app.data.sample_documents import DOCUMENTS
    extractor = EntityExtractor()
    knowledge_graph.graph.clear()
    for doc in DOCUMENTS:
        triplets = extractor.extract_from_text(doc["content"], x_api_key)
        for subj, rel, obj in triplets:
            knowledge_graph.add_relationship(subj, obj, rel, {"source_doc_id": doc["id"]})
    return {"status": "ok", "nodes": knowledge_graph.graph.number_of_nodes(), "edges": knowledge_graph.graph.number_of_edges()}

# --- Frontend Routes (serve static HTML) ---

@app.get("/")
async def landing_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/dashboard")
async def dashboard_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "dashboard.html"))

@app.get("/architecture")
async def architecture_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "architecture.html"))

# Mount static files (CSS, JS, assets) AFTER API routes to avoid conflicts
app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")
