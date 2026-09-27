<div align="center">

# 🧠 NeuroGraph

### Brain Connectivity Analysis powered by GraphRAG

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Discover hidden connections between brain regions using knowledge graph traversal combined with vector search.*

</div>

---

## 🎯 What is NeuroGraph?

NeuroGraph is a **GraphRAG** (Graph Retrieval-Augmented Generation) system that models brain regions, neural pathways, and their connections as a **knowledge graph**. It combines **graph traversal** with **vector search** to answer complex multi-hop neuroscience questions that standard RAG cannot handle.

### The Problem with Standard RAG

Standard RAG finds similar text chunks via vector search — but fails when the answer is spread across **multiple documents**. For example:

> *"Is there a connection between the hippocampus and Korsakoff syndrome?"*

This requires following a chain: **Hippocampus → Prefrontal Cortex → Thalamus → Korsakoff Syndrome** — information spread across 3 different documents.

### The GraphRAG Solution

NeuroGraph builds a knowledge graph from documents and traverses it to find multi-hop connections, then combines this with vector search for comprehensive answers.

---

## ✨ Features

- **🧠 Knowledge Graph** — Brain regions, neural pathways, and their connections as an interactive graph (NetworkX)
- **🔗 Multi-Hop Reasoning** — Follow chains of relationships across multiple documents
- **🌐 3D Visualization** — Stunning force-directed 3D graph with glow effects (Three.js)
- **⚡ Hybrid Retrieval** — Combines graph traversal with vector search (ChromaDB)
- **📊 Real-time Metrics** — Track hops, latency, and nodes visited per query
- **🔒 Privacy-First** — API keys stored only in browser session, never on the server

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Question                         │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼                           ▼
┌─────────────────┐       ┌──────────────────┐
│  Vector Search  │       │ Entity Extraction │
│  (ChromaDB)     │       │  (Keyword Match)  │
│                 │       │        │          │
│  Top-K chunks   │       │        ▼          │
│                 │       │  Graph Traversal  │
│                 │       │  (NetworkX)       │
│                 │       │  1-3 hops         │
└────────┬────────┘       └────────┬──────────┘
         │                         │
         └──────────┬──────────────┘
                    ▼
          ┌──────────────────┐
          │  Merge Context   │
          │  + Build Prompt  │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │   Gemini LLM     │
          │   (via API Key)  │
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │  Answer + Path   │
          │  + Metrics       │
          └──────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
cd neurograph/backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### 3. Enter Your API Key

1. Click "API Key" in the dashboard header
2. Enter your [Google Gemini API key](https://aistudio.google.com/apikey)
3. The key is stored **only in your browser tab** — never sent to the server for storage

---

## 🔒 Security

| Layer | Protection |
|-------|-----------|
| **`.gitignore`** | `.env` files are never committed |
| **Browser Storage** | API key in `sessionStorage` only (cleared on tab close) |
| **Backend** | Key passed per-request via `X-API-Key` header, immediately discarded |
| **Logging** | API keys are never logged or cached |
| **No Cookies** | No persistent client-side storage |

---

## 🧪 Testing

```bash
cd neurograph/backend
pytest tests/ -v
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend | FastAPI | REST API server |
| Graph Engine | NetworkX | Knowledge graph storage & traversal |
| Vector Store | ChromaDB | Embedding-based document retrieval |
| Embeddings | sentence-transformers | Local embeddings (no API needed) |
| LLM | Google Gemini | Answer generation |
| 3D Visualization | 3d-force-graph + Three.js | Interactive graph rendering |
| Containerization | Docker | One-click deployment |

---

## 📁 Project Structure

```
neurograph/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Settings (no secrets)
│   │   ├── models.py            # Pydantic schemas
│   │   ├── data/                # Demo dataset + prebuilt graph
│   │   ├── graph/               # Knowledge graph (NetworkX)
│   │   └── rag/                 # RAG engine, vector store, LLM
│   ├── tests/                   # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html               # Landing page
│   ├── dashboard.html           # Interactive dashboard
│   ├── architecture.html        # System architecture explanation
│   ├── css/                     # Sci-Fi dark theme
│   └── js/                      # 3D graph, particles, query logic
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
