import json
import networkx as nx
from typing import List, Dict, Any, Optional

class BrainKnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_entity(self, name: str, entity_type: str, metadata: Optional[Dict] = None):
        if metadata is None:
            metadata = {}
        self.graph.add_node(name, id=name, name=name, type=entity_type, metadata=metadata)

    def add_relationship(self, source: str, target: str, relation: str, metadata: Optional[Dict] = None):
        if metadata is None:
            metadata = {}
        if source not in self.graph:
            self.add_entity(source, 'unknown')
        if target not in self.graph:
            self.add_entity(target, 'unknown')
        self.graph.add_edge(source, target, relation=relation, metadata=metadata)

    def traverse(self, start_entity: str, max_hops: int = 3) -> List[List[Dict]]:
        if start_entity not in self.graph:
            return []
        
        paths = []
        for target in self.graph.nodes():
            if target != start_entity:
                try:
                    for path in nx.all_simple_edge_paths(self.graph, start_entity, target, cutoff=max_hops):
                        path_data = []
                        for u, v in path:
                            edge_data = self.graph.get_edge_data(u, v)
                            path_data.append({
                                'source': u,
                                'target': v,
                                'relation': edge_data.get('relation', '')
                            })
                        paths.append(path_data)
                except nx.NetworkXNoPath:
                    pass
        return paths

    def find_path(self, entity_a: str, entity_b: str) -> List[Dict]:
        try:
            path = nx.shortest_path(self.graph, entity_a, entity_b)
            edges = []
            for i in range(len(path) - 1):
                u = path[i]
                v = path[i+1]
                edge_data = self.graph.get_edge_data(u, v)
                edges.append({
                    'source': u,
                    'target': v,
                    'relation': edge_data.get('relation', '')
                })
            return edges
        except nx.NetworkXNoPath:
            return []
        except nx.NodeNotFound:
            return []

    def get_subgraph(self, entity_names: List[str]) -> Dict[str, Any]:
        valid_nodes = [n for n in entity_names if n in self.graph]
        subgraph = self.graph.subgraph(valid_nodes)
        nodes = []
        for n, data in subgraph.nodes(data=True):
            nodes.append(data)
        links = []
        for u, v, data in subgraph.edges(data=True):
            links.append({'source': u, 'target': v, **data})
        return {'nodes': nodes, 'links': links}

    def to_dict(self) -> Dict[str, Any]:
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append(data)
        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({'source': u, 'target': v, **data})
        return {'nodes': nodes, 'edges': edges}

    def from_dict(self, data: Dict[str, Any]):
        self.graph.clear()
        for node in data.get('nodes', []):
            self.add_entity(node['name'], node.get('type', 'unknown'), node.get('metadata', {}))
        for edge in data.get('edges', []):
            self.add_relationship(edge['source'], edge['target'], edge.get('relation', ''), edge.get('metadata', {}))

    def load_prebuilt(self):
        import os
        filepath = os.path.join(os.path.dirname(__file__), '../data/prebuilt_graph.json')
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                data = json.load(f)
                self.from_dict(data)

    def get_statistics(self) -> Dict[str, Any]:
        by_type = {}
        for n, data in self.graph.nodes(data=True):
            t = data.get('type', 'unknown')
            by_type[t] = by_type.get(t, 0) + 1
        return {
            'total_nodes': self.graph.number_of_nodes(),
            'total_edges': self.graph.number_of_edges(),
            'by_type': by_type
        }

    def search_entities(self, query: str) -> List[Dict]:
        results = []
        query = query.lower()
        for n, data in self.graph.nodes(data=True):
            if query in n.lower():
                results.append(data)
        return results[:10]

    def to_vis_json(self) -> Dict[str, Any]:
        type_sizes = {'brain_region': 5, 'tract': 3, 'function': 4, 'disorder': 4}
        nodes = []
        for n, data in self.graph.nodes(data=True):
            node_type = data.get('type', 'unknown')
            meta = data.get('metadata', {})
            nodes.append({
                "id": n,
                "name": n,
                "type": node_type,
                "val": type_sizes.get(node_type, 3),
                "description": meta.get('description', ''),
                "group": node_type
            })
        links = []
        for u, v, data in self.graph.edges(data=True):
            links.append({"source": u, "target": v, "relation": data.get('relation', '')})
        return {"nodes": nodes, "links": links}
