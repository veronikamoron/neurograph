import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

class NeuroscienceVectorStore:
    def __init__(self, persist_dir: str = './chroma_db'):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(name="neuroscience_docs")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def add_documents(self, documents: List[Dict[str, Any]]):
        ids = []
        texts = []
        metadatas = []
        
        for doc in documents:
            ids.append(doc['id'])
            texts.append(f"{doc['title']}: {doc['content']}")
            metadatas.append({"title": doc['title']})
            
        embeddings = self.model.encode(texts).tolist()
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=[doc['content'] for doc in documents],
            metadatas=metadatas
        )

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        query_embedding = self.model.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=k
        )
        
        docs = []
        if results['ids'] and len(results['ids']) > 0:
            for i in range(len(results['ids'][0])):
                docs.append({
                    'doc_id': results['ids'][0][i],
                    'content': results['documents'][0][i],
                    'score': results['distances'][0][i] if 'distances' in results and results['distances'] else 0.0
                })
        return docs

    def initialize_from_sample_data(self):
        from app.data.sample_documents import DOCUMENTS
        # Only add if collection is empty
        if self.collection.count() == 0:
            self.add_documents(DOCUMENTS)
