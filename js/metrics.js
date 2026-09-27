// Dashboard Metrics Updates
function initMetrics() {
    resetMetrics();
}

function updateMetrics(data) {
    if (!data) return;
    
    animateCounter('metric-hops', data.hops || 0);
    animateCounter('metric-nodes', data.nodes_visited || 0);
    animateCounter('metric-latency', data.latency_ms || 0, 'ms');
    animateCounter('metric-vectors', data.vector_results || 0);
    animateCounter('metric-sources', data.total_sources || 0);
}

function resetMetrics() {
    const elements = ['metric-hops', 'metric-nodes', 'metric-latency', 'metric-vectors', 'metric-sources'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
    });
}

function animateCounter(id, targetValue, suffix = '') {
    const element = document.getElementById(id);
    if (!element) return;
    
    const duration = 1000; // ms
    const steps = 30;
    const stepTime = duration / steps;
    
    let current = 0;
    const increment = targetValue / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
        
        // Add a little pop effect on change
        element.style.transform = 'scale(1.1)';
        element.style.color = 'var(--accent-magenta)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = 'var(--primary-glow)';
        }, 100);
        
    }, stepTime);
}

window.initMetrics = initMetrics;
window.updateMetrics = updateMetrics;
window.resetMetrics = resetMetrics;
