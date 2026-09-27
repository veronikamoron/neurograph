let graphInstance = null;
let graphData = { nodes: [], links: [] };

// Neuroscience entity color palette
const TYPE_COLORS = {
    'brain_region': '#00f0ff', // Electric Cyan
    'tract': '#ff00ff',        // Neon Magenta
    'function': '#00ff88',     // Emerald Green
    'disorder': '#ff4444'      // Crimson Red
};

function initGraph(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Use loaded data or fallback to rich 25-node neuroscience connectome
    if (data && data.nodes && data.nodes.length > 0) {
        graphData = data;
    } else {
        graphData = generateSampleData();
    }

    const width = container.clientWidth || Math.floor(window.innerWidth * 0.6);
    const height = container.clientHeight || (window.innerHeight - 70);

    container.innerHTML = '';

    // Initialize 3D Force Graph using native high-performance WebGL shaders
    graphInstance = ForceGraph3D()(container)
        .width(width)
        .height(height)
        .backgroundColor('#0a0a0f')
        .graphData(graphData)
        .nodeId('id')
        .nodeLabel(node => `
            <div style="background: rgba(10, 15, 30, 0.95); border: 1px solid #00f0ff; padding: 10px 14px; border-radius: 8px; color: #fff; font-family: Inter, sans-serif; box-shadow: 0 0 20px rgba(0,240,255,0.4); max-width: 250px;">
                <div style="font-weight: 700; color: #fff; font-size: 14px;">${node.name || node.id}</div>
                <div style="color: ${TYPE_COLORS[node.type] || '#00f0ff'}; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-top: 3px;">
                    ${(node.type || 'Entity').replace('_', ' ')}
                </div>
                ${node.description ? `<div style="color: #c0c0c0; font-size: 12px; margin-top: 6px; line-height: 1.4;">${node.description}</div>` : ''}
            </div>
        `)
        .nodeColor(node => {
            if (node.highlighted) return '#ffff00'; // High-visibility yellow along traversed paths
            return TYPE_COLORS[node.type] || '#00f0ff';
        })
        .nodeVal(node => (node.highlighted ? 14 : (node.val || 6)))
        .nodeResolution(24)
        .nodeRelSize(5.5)
        .nodeOpacity(0.92)
        // Organic curved white-matter tracts (axonal pathways)
        .linkCurvature(0.22)
        .linkCurveRotation(0.25)
        .linkColor(link => link.highlighted ? '#00f0ff' : 'rgba(80, 140, 230, 0.25)')
        .linkWidth(link => link.highlighted ? 4.5 : 1.2)
        // Spontaneous Action Potentials (synaptic baseline activity + firing spikes)
        .linkDirectionalParticles(link => link.highlighted ? 8 : 2)
        .linkDirectionalParticleWidth(link => link.highlighted ? 5 : 2.2)
        .linkDirectionalParticleColor(link => link.highlighted ? '#ffff00' : '#00f0ff')
        .linkDirectionalParticleSpeed(link => link.highlighted ? 0.018 : 0.0035)
        .onNodeClick(node => {
            if (!node || typeof node.x !== 'number') return;
            const distance = 120;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            graphInstance.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio + 20, z: node.z * distRatio },
                node,
                1500
            );
        });

    // D3 Force physics tuned for anatomical brain lobe clustering
    if (graphInstance.d3Force) {
        if (graphInstance.d3Force('charge')) graphInstance.d3Force('charge').strength(-130);
        if (graphInstance.d3Force('link')) graphInstance.d3Force('link').distance(65);
    }

    // Resize listener
    window.addEventListener('resize', () => {
        if (graphInstance && container) {
            graphInstance.width(container.clientWidth);
            graphInstance.height(container.clientHeight);
        }
    });
}

function highlightPath(nodeIds, linkPairs) {
    if (!graphInstance) return;

    const safeNodeIds = Array.isArray(nodeIds) ? nodeIds.map(s => String(s).toLowerCase()) : [];

    (graphData.nodes || []).forEach(n => {
        const idMatch = safeNodeIds.includes(String(n.id).toLowerCase());
        const nameMatch = safeNodeIds.includes(String(n.name).toLowerCase());
        n.highlighted = idMatch || nameMatch;
    });

    (graphData.links || []).forEach(l => {
        const s = String(typeof l.source === 'object' ? l.source.id : l.source).toLowerCase();
        const t = String(typeof l.target === 'object' ? l.target.id : l.target).toLowerCase();

        l.highlighted = (linkPairs || []).some(pair => {
            const p0 = String(pair[0]).toLowerCase();
            const p1 = String(pair[1]).toLowerCase();
            return (p0 === s && p1 === t) || (p0 === t && p1 === s);
        });
    });

    // Reactively refresh WebGL shaders with updated styles
    graphInstance
        .nodeColor(graphInstance.nodeColor())
        .nodeVal(graphInstance.nodeVal())
        .linkColor(graphInstance.linkColor())
        .linkWidth(graphInstance.linkWidth())
        .linkDirectionalParticles(graphInstance.linkDirectionalParticles())
        .linkDirectionalParticleColor(graphInstance.linkDirectionalParticleColor())
        .linkDirectionalParticleSpeed(graphInstance.linkDirectionalParticleSpeed());

    // Fly camera toward active path target
    if (safeNodeIds.length > 0) {
        const targetNode = (graphData.nodes || []).find(n =>
            safeNodeIds.includes(String(n.id).toLowerCase()) || safeNodeIds.includes(String(n.name).toLowerCase())
        );
        if (targetNode && typeof targetNode.x === 'number') {
            graphInstance.cameraPosition(
                { x: targetNode.x + 50, y: targetNode.y + 40, z: targetNode.z + 160 },
                targetNode,
                1500
            );
        }
    }
}

function resetHighlight() {
    if (!graphInstance) return;

    (graphData.nodes || []).forEach(n => {
        n.highlighted = false;
    });

    (graphData.links || []).forEach(l => {
        l.highlighted = false;
    });

    graphInstance
        .nodeColor(graphInstance.nodeColor())
        .nodeVal(graphInstance.nodeVal())
        .linkColor(graphInstance.linkColor())
        .linkWidth(graphInstance.linkWidth())
        .linkDirectionalParticles(graphInstance.linkDirectionalParticles())
        .linkDirectionalParticleColor(graphInstance.linkDirectionalParticleColor())
        .linkDirectionalParticleSpeed(graphInstance.linkDirectionalParticleSpeed());
}

// 25-Node Curated Neuroscience Connectome
function generateSampleData() {
    return {
        nodes: [
            { id: 'Hippocampus', name: 'Hippocampus', type: 'brain_region', val: 9, description: 'Critical for learning, memory consolidation, and spatial navigation.' },
            { id: 'Prefrontal Cortex', name: 'Prefrontal Cortex', type: 'brain_region', val: 9, description: 'Executive function, planning complex cognitive behavior, and decision making.' },
            { id: 'Amygdala', name: 'Amygdala', type: 'brain_region', val: 8, description: 'Core limbic hub for processing emotions, threat detection, and fear conditioning.' },
            { id: 'Thalamus', name: 'Thalamus', type: 'brain_region', val: 8, description: 'Central relay station directing motor and sensory signals to the cerebral cortex.' },
            { id: 'Cerebellum', name: 'Cerebellum', type: 'brain_region', val: 7, description: 'Coordinates voluntary movement, posture, balance, and motor learning.' },
            { id: 'Substantia Nigra', name: 'Substantia Nigra', type: 'brain_region', val: 7, description: 'Basal ganglia midbrain structure producing dopamine critical for movement.' },
            { id: 'Basal Ganglia', name: 'Basal Ganglia', type: 'brain_region', val: 8, description: 'Subcortical nuclei network regulating voluntary motor control and habit formation.' },
            { id: 'Brocas Area', name: 'Broca\'s Area', type: 'brain_region', val: 7, description: 'Frontal lobe region responsible for speech production and articulation.' },
            { id: 'Wernickes Area', name: 'Wernicke\'s Area', type: 'brain_region', val: 7, description: 'Temporal lobe region mediating language comprehension and semantic decoding.' },
            { id: 'Entorhinal Cortex', name: 'Entorhinal Cortex', type: 'brain_region', val: 7, description: 'Gateway to the hippocampus for memory formation and grid-cell navigation.' },
            { id: 'Visual Cortex', name: 'Visual Cortex (V1)', type: 'brain_region', val: 7, description: 'Processes primary visual input received from the retinal thalamic pathway.' },
            { id: 'Motor Cortex', name: 'Motor Cortex', type: 'brain_region', val: 8, description: 'Initiates voluntary motor execution via direct spinal tract projections.' },

            // White Matter Tracts
            { id: 'Fornix', name: 'Fornix Tract', type: 'tract', val: 6, description: 'Major arching white matter bundle connecting hippocampus to mamillary bodies and thalamus.' },
            { id: 'Arcuate Fasciculus', name: 'Arcuate Fasciculus', type: 'tract', val: 6, description: 'White matter tract directly bridging Wernicke\'s Area and Broca\'s Area.' },
            { id: 'Uncinate Fasciculus', name: 'Uncinate Fasciculus', type: 'tract', val: 6, description: 'White matter tract connecting the limbic amygdala/hippocampus to the orbitofrontal cortex.' },
            { id: 'Corticospinal Tract', name: 'Corticospinal Tract', type: 'tract', val: 6, description: 'Massive efferent motor highway from motor cortex to spinal cord.' },
            { id: 'Corpus Callosum', name: 'Corpus Callosum', type: 'tract', val: 7, description: 'Broad neural highway bridging the left and right cerebral hemispheres.' },

            // Cognitive Functions
            { id: 'Memory Formation', name: 'Memory Formation', type: 'function', val: 6, description: 'Encoding, storage, and retrieval of episodic and declarative memories.' },
            { id: 'Emotion Processing', name: 'Emotion Processing', type: 'function', val: 6, description: 'Evaluation and physiological manifestation of affective states.' },
            { id: 'Motor Control', name: 'Motor Control', type: 'function', val: 6, description: 'Regulation, planning, and smooth coordination of voluntary muscle movements.' },
            { id: 'Language Production', name: 'Language Production', type: 'function', val: 6, description: 'Syntactic structuring and vocal motor articulation of speech.' },
            { id: 'Language Comprehension', name: 'Language Comprehension', type: 'function', val: 6, description: 'Semantic parsing and auditory decoding of verbal language.' },

            // Neurological Disorders
            { id: 'Alzheimers Disease', name: 'Alzheimer\'s Disease', type: 'disorder', val: 7, description: 'Progressive neurodegeneration characterized by early tau/amyloid pathology in hippocampus.' },
            { id: 'Parkinsons Disease', name: 'Parkinson\'s Disease', type: 'disorder', val: 7, description: 'Movement disorder caused by dopaminergic neurodegeneration in the substantia nigra.' },
            { id: 'PTSD', name: 'PTSD', type: 'disorder', val: 6, description: 'Trauma disorder featuring amygdala hyperactivity and impaired prefrontal inhibition.' },
            { id: 'Brocas Aphasia', name: 'Broca\'s Aphasia', type: 'disorder', val: 6, description: 'Expressive language deficit resulting in non-fluent, effortful speech.' }
        ],
        links: [
            // Hippocampus Circuit
            { source: 'Hippocampus', target: 'Fornix', relation: 'projects_via' },
            { source: 'Fornix', target: 'Thalamus', relation: 'relays_to' },
            { source: 'Thalamus', target: 'Prefrontal Cortex', relation: 'projects_to' },
            { source: 'Hippocampus', target: 'Memory Formation', relation: 'mediates' },
            { source: 'Entorhinal Cortex', target: 'Hippocampus', relation: 'inputs_to' },
            { source: 'Hippocampus', target: 'Alzheimers Disease', relation: 'pathology_site' },
            { source: 'Hippocampus', target: 'Amygdala', relation: 'interconnects' },

            // Amygdala & Frontal Circuit
            { source: 'Amygdala', target: 'Uncinate Fasciculus', relation: 'projects_via' },
            { source: 'Uncinate Fasciculus', target: 'Prefrontal Cortex', relation: 'terminates_in' },
            { source: 'Amygdala', target: 'Emotion Processing', relation: 'mediates' },
            { source: 'Amygdala', target: 'PTSD', relation: 'hyperactive_in' },

            // Language Circuit
            { source: 'Wernickes Area', target: 'Arcuate Fasciculus', relation: 'projects_via' },
            { source: 'Arcuate Fasciculus', target: 'Brocas Area', relation: 'terminates_in' },
            { source: 'Brocas Area', target: 'Language Production', relation: 'mediates' },
            { source: 'Wernickes Area', target: 'Language Comprehension', relation: 'mediates' },
            { source: 'Brocas Area', target: 'Brocas Aphasia', relation: 'lesion_site' },

            // Motor Circuit
            { source: 'Motor Cortex', target: 'Corticospinal Tract', relation: 'projects_via' },
            { source: 'Corticospinal Tract', target: 'Motor Control', relation: 'executes' },
            { source: 'Substantia Nigra', target: 'Basal Ganglia', relation: 'dopaminergic_input' },
            { source: 'Basal Ganglia', target: 'Thalamus', relation: 'inhibits' },
            { source: 'Thalamus', target: 'Motor Cortex', relation: 'excites' },
            { source: 'Substantia Nigra', target: 'Parkinsons Disease', relation: 'degeneration_site' },
            { source: 'Cerebellum', target: 'Thalamus', relation: 'coordination_loop' }
        ]
    };
}

window.initGraph = initGraph;
window.highlightPath = highlightPath;
window.resetHighlight = resetHighlight;
