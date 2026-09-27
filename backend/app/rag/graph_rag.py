import time
from typing import Dict, Any, List, Tuple
from app.graph.knowledge_graph import BrainKnowledgeGraph
from app.rag.vector_store import NeuroscienceVectorStore
from app.rag.llm_provider import GeminiProvider

class GraphRAGEngine:
    def __init__(self, knowledge_graph: BrainKnowledgeGraph, vector_store: NeuroscienceVectorStore, llm_provider: GeminiProvider):
        self.knowledge_graph = knowledge_graph
        self.vector_store = vector_store
        self.llm_provider = llm_provider

    def query(self, question: str, api_key: str, max_hops: int = 2) -> Dict[str, Any]:
        start_time = time.time()
        
        entities = self._extract_question_entities(question)
        graph_ctx, graph_path = self._graph_retrieval(entities, max_hops)
        vector_ctx = self._vector_retrieval(question, k=5)
        
        context = self._merge_context(graph_ctx, vector_ctx)
        prompt = self._build_prompt(question, context)
        
        answer = self.llm_provider.generate(prompt, api_key)
        
        end_time = time.time()
        latency_ms = int((end_time - start_time) * 1000)
        
        # Collect unique node IDs from traversed edges for path highlighting
        path_node_ids = set()
        for edge in graph_path:
            path_node_ids.add(edge['source'])
            path_node_ids.add(edge['target'])

        sources = [c['content'] for c in vector_ctx]
        
        return {
            "answer": answer,
            "graph_path": {"nodes": list(path_node_ids), "edges": graph_path},
            "sources": sources,
            "metrics": {
                "hops": max_hops,
                "nodes_visited": len(path_node_ids),
                "latency_ms": latency_ms,
                "vector_results": len(vector_ctx),
                "total_sources": len(sources)
            }
        }

    def _extract_question_entities(self, question: str) -> List[str]:
        q = question.lower()
        found = []
        for node in self.knowledge_graph.graph.nodes():
            if node.lower() in q:
                found.append(node)
        return found

    def _graph_retrieval(self, entities: List[str], max_hops: int) -> Tuple[List[Dict], List[Dict]]:
        paths = []
        for entity in entities:
            paths.extend(self.knowledge_graph.traverse(entity, max_hops=max_hops))
        
        edges = []
        context_str = ""
        for path in paths[:5]:
            for edge in path:
                edges.append(edge)
                context_str += f"{edge['source']} {edge['relation']} {edge['target']}. "
        
        return [{"content": context_str}], edges

    def _vector_retrieval(self, question: str, k: int = 5) -> List[Dict]:
        return self.vector_store.search(question, k=k)

    def _merge_context(self, graph_ctx: List[Dict], vector_ctx: List[Dict]) -> str:
        ctx = []
        if graph_ctx and graph_ctx[0]['content']:
            ctx.append("Graph Knowledge: " + graph_ctx[0]['content'])
        
        v_ctx = " ".join([c['content'] for c in vector_ctx])
        if v_ctx:
            ctx.append("Document Knowledge: " + v_ctx)
            
        return "\n".join(ctx)

    def _build_prompt(self, question: str, context: str) -> str:
        return f'''You are NeuroGraph, an expert Neuroscience AI that analyzes brain connectivity using knowledge graphs and multi-hop retrieval.

Instructions:
1. Ground your answer in the provided brain connectivity and document context.
2. If the user question is gibberish (e.g., random characters like "ddjijceioncioe") or completely unrelated to neuroscience, state clearly that no recognized brain regions, tracts, or neuroscience concepts were found in the question.
3. When answering valid questions, highlight the specific pathways (e.g. Regions -> Tracts -> Target regions -> Functions/Disorders).

Context:
{context}

Question: {question}
Answer:'''
