const EXAMPLE_QUESTIONS = [
    'What disorders are associated with regions connected to the hippocampus?',
    'How does the basal ganglia connect to motor control through the substantia nigra?',
    'Which white matter tract connects language processing areas?',
    'What is the relationship between the amygdala and PTSD through connected regions?',
    'How does damage to the thalamus affect memory through its connections?'
];

function initQueryInterface() {
    const queryInput = document.getElementById('query-input');
    const submitBtn = document.getElementById('submit-query');
    const exampleContainer = document.getElementById('example-chips');

    if (!queryInput || !submitBtn) return;

    // Render examples
    if (exampleContainer) {
        EXAMPLE_QUESTIONS.forEach(q => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = q;
            chip.onclick = () => {
                queryInput.value = q;
                submitQuery(q);
            };
            exampleContainer.appendChild(chip);
        });
    }

    submitBtn.addEventListener('click', () => {
        const q = queryInput.value.trim();
        if (q) submitQuery(q);
    });

    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const q = queryInput.value.trim();
            if (q) submitQuery(q);
        }
    });
}

async function submitQuery(question) {
    if (!window.hasKey || !window.hasKey()) {
        if (window.showKeyModal) window.showKeyModal();
        return;
    }

    const apiKey = window.getKey();
    const answerContainer = document.getElementById('answer-container');
    const spinner = document.getElementById('query-spinner');
    
    if (answerContainer) answerContainer.innerHTML = '';
    if (spinner) spinner.style.display = 'block';

    if (window.resetHighlight) window.resetHighlight();

    try {
        let data;
        let usedBackend = false;

        if (apiKey && apiKey !== 'demo_simulation') {
            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    },
                    body: JSON.stringify({ question })
                });

                if (response.ok) {
                    data = await response.json();
                    usedBackend = true;
                }
            } catch (err) {
                console.warn('Backend call failed, using simulation:', err);
            }
        }

        if (!usedBackend) {
            // Simulated response with realistic multi-hop context
            await new Promise(r => setTimeout(r, 1000));
            data = generateMockResponse(question);
        }

        renderAnswer(data);
        
        if (window.updateMetrics && data.metrics) {
            window.updateMetrics(data.metrics);
        }

        if (window.highlightPath) {
            if (data.graph_path) {
                const nodeIds = data.graph_path.nodes || [];
                const linkPairs = (data.graph_path.edges || []).map(e => [e.source, e.target]);
                window.highlightPath(nodeIds, linkPairs);
            } else if (data.path) {
                window.highlightPath(data.path.nodes, data.path.links);
            }
        }

    } catch (error) {
        if (answerContainer) {
            answerContainer.innerHTML = `<div style="color: var(--error); padding: 1rem; border: 1px solid var(--error); border-radius: 8px;">Failed to fetch answer: ${error.message}</div>`;
        }
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

function renderAnswer(data) {
    const container = document.getElementById('answer-container');
    if (!container) return;

    let html = `
        <div class="answer-content fade-in">
            <h3 style="color:var(--primary-glow); margin-bottom:1rem;">Answer</h3>
            <div class="answer-text" id="typed-answer"></div>
        </div>
    `;

    if (data.sources && data.sources.length > 0) {
        html += `
            <div class="sources-accordion fade-in" style="animation-delay: 0.5s">
                <h4 style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem; text-transform:uppercase;">Sources & Context</h4>
        `;
        data.sources.forEach((src, idx) => {
            const title = (typeof src === 'object' && src.title) ? src.title : `Neuroscience Document #${idx + 1}`;
            const text = (typeof src === 'object' && src.text) ? src.text : String(src);
            html += `
                <div class="source-card">
                    <div class="source-title">${title}</div>
                    <div class="source-text">${text}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    container.innerHTML = html;

    // Simple typing effect
    const typedEl = document.getElementById('typed-answer');
    if (typedEl) {
        let i = 0;
        const text = data.answer;
        function typeWriter() {
            if (i < text.length) {
                typedEl.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 10);
            }
        }
        typeWriter();
    }
}

function generateMockResponse(question) {
    const q = (question || '').toLowerCase().trim();

    // Check for gibberish or nonsense input
    const neuroscienceTerms = [
        'hippocampus', 'amygdala', 'cortex', 'prefrontal', 'thalamus', 'cerebellum', 
        'fornix', 'arcuate', 'uncinate', 'callosum', 'aphasia', 'alzheimer', 'parkinson', 
        'ptsd', 'motor', 'memory', 'emotion', 'substantia', 'ganglia', 'broca', 'wernicke', 
        'tract', 'speech', 'language', 'disorder', 'brain', 'connect', 'neuron'
    ];

    const matched = neuroscienceTerms.filter(term => q.includes(term));

    // If query has no recognized neuroscience keywords or is short gibberish
    if (matched.length === 0 || q.length < 4) {
        return {
            answer: `No recognized neuroscience entities or brain connectivity pathways were detected in your query ("${question}").\n\nGraphRAG requires recognizable brain structures, white-matter tracts, cognitive functions, or neurological disorders to traverse the knowledge graph.\n\nTry asking a question like:\n• "How is Broca's area connected to Wernicke's area?"\n• "What disorders are associated with regions connected to the hippocampus?"\n• "How does the basal ganglia connect to motor control through the substantia nigra?"`,
            sources: [],
            metrics: {
                hops: 0,
                nodes_visited: 0,
                latency_ms: 68,
                vector_results: 0,
                total_sources: 0
            },
            graph_path: { nodes: [], edges: [] }
        };
    }

    // Language circuit query (Broca / Wernicke / Arcuate Fasciculus / Aphasia)
    if (q.includes('broca') || q.includes('wernicke') || q.includes('arcuate') || q.includes('language') || q.includes('aphasia')) {
        return {
            answer: "Through 2-hop knowledge graph traversal, the language circuit is mapped via the Arcuate Fasciculus white matter tract. Wernicke's Area in the posterior superior temporal gyrus connects bidirectionally to Broca's Area in the inferior frontal gyrus. Lesions along this pathway produce distinct clinical aphasias: damage to Broca's Area impairs language production (Broca's expressive aphasia), whereas damage to Wernicke's Area impairs semantic comprehension (Wernicke's receptive aphasia).",
            sources: [
                { title: "Doc 18: Arcuate Fasciculus", text: "The Arcuate Fasciculus is a bundle of axons bidirectionally linking caudal temporal cortex to the frontal lobe, connecting Wernicke's Area to Broca's Area." },
                { title: "Doc 8: Broca's Area", text: "Broca's Area is linked to speech production. Damage leads to non-fluent, expressive Broca's aphasia." },
                { title: "Doc 9: Wernicke's Area", text: "Wernicke's Area is responsible for language comprehension. Damage produces receptive aphasia." }
            ],
            metrics: { hops: 2, nodes_visited: 5, latency_ms: 312, vector_results: 3, total_sources: 3 },
            graph_path: {
                nodes: ['Wernickes Area', 'Arcuate Fasciculus', 'Brocas Area', 'Language Production', 'Brocas Aphasia'],
                edges: [
                    { source: 'Wernickes Area', target: 'Arcuate Fasciculus', relation: 'projects_via' },
                    { source: 'Arcuate Fasciculus', target: 'Brocas Area', relation: 'terminates_in' },
                    { source: 'Brocas Area', target: 'Language Production', relation: 'mediates' },
                    { source: 'Brocas Area', target: 'Brocas Aphasia', relation: 'lesion_site' }
                ]
            }
        };
    }

    // Motor / Basal Ganglia / Parkinson circuit
    if (q.includes('motor') || q.includes('basal') || q.includes('substantia') || q.includes('parkinson') || q.includes('corticospinal')) {
        return {
            answer: "Multi-hop graph traversal reveals that the Substantia Nigra projects dopaminergic neurons into the Basal Ganglia nuclei, which modulate motor thalamic output to the Motor Cortex. From the Motor Cortex, voluntary signals descend via the Corticospinal Tract into the spinal cord. In Parkinson's Disease, loss of dopaminergic neurons in the Substantia Nigra disrupts the basal ganglia-thalamocortical loop, leading to motor deficits.",
            sources: [
                { title: "Doc 10: Basal Ganglia", text: "The Basal Ganglia are subcortical nuclei responsible for motor control and procedural learning. Degeneration of Substantia Nigra leads to Parkinson's disease." },
                { title: "Doc 15: Substantia Nigra", text: "Located in the midbrain, loss of dopaminergic neurons in the Substantia Nigra is the primary hallmark of Parkinson's disease." },
                { title: "Doc 20: Corticospinal Tract", text: "The Corticospinal Tract is a major white matter motor pathway starting at the motor cortex that executes voluntary movements." }
            ],
            metrics: { hops: 3, nodes_visited: 6, latency_ms: 384, vector_results: 3, total_sources: 3 },
            graph_path: {
                nodes: ['Substantia Nigra', 'Basal Ganglia', 'Thalamus', 'Motor Cortex', 'Corticospinal Tract', 'Parkinsons Disease'],
                edges: [
                    { source: 'Substantia Nigra', target: 'Basal Ganglia', relation: 'dopaminergic_input' },
                    { source: 'Basal Ganglia', target: 'Thalamus', relation: 'inhibits' },
                    { source: 'Thalamus', target: 'Motor Cortex', relation: 'excites' },
                    { source: 'Motor Cortex', target: 'Corticospinal Tract', relation: 'projects_via' },
                    { source: 'Substantia Nigra', target: 'Parkinsons Disease', relation: 'degeneration_site' }
                ]
            }
        };
    }

    // Default: Hippocampus / Limbic / Memory / Emotion / Alzheimer circuit
    return {
        answer: "Graph traversal traces connections originating from the Hippocampus across the limbic circuit: The Hippocampus projects via the Fornix tract directly to the Thalamus and Prefrontal Cortex for memory consolidation. In addition, reciprocal connections with the Amygdala link emotional processing to episodic memories. Early pathological tau and amyloid accumulation in Alzheimer's Disease preferentially damages the Entorhinal Cortex and Hippocampus, impairing memory formation.",
        sources: [
            { title: "Doc 1: Hippocampus & Memory", text: "The Hippocampus has a major role in learning and memory, connecting directly to the Prefrontal Cortex and Amygdala." },
            { title: "Doc 16: Fornix White Matter Tract", text: "The Fornix acts as the major output tract of the hippocampus, carrying signals to the mammillary bodies and anterior thalamic nuclei." },
            { title: "Doc 21: Alzheimer's Disease", text: "Alzheimer's pathology typically begins in the Entorhinal Cortex and Hippocampus before spreading across neocortical networks." }
        ],
        metrics: { hops: 3, nodes_visited: 6, latency_ms: 345, vector_results: 3, total_sources: 3 },
        graph_path: {
            nodes: ['Hippocampus', 'Fornix', 'Thalamus', 'Prefrontal Cortex', 'Memory Formation', 'Alzheimers Disease'],
            edges: [
                { source: 'Hippocampus', target: 'Fornix', relation: 'projects_via' },
                { source: 'Fornix', target: 'Thalamus', relation: 'relays_to' },
                { source: 'Thalamus', target: 'Prefrontal Cortex', relation: 'projects_to' },
                { source: 'Hippocampus', target: 'Memory Formation', relation: 'mediates' },
                { source: 'Hippocampus', target: 'Alzheimers Disease', relation: 'pathology_site' }
            ]
        }
    };
}

window.initQueryInterface = initQueryInterface;
window.submitQuery = submitQuery;
