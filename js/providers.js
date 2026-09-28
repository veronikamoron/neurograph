// Provider Config for API Keys
function initProviderConfig() {
    updateKeyStatus();
    
    // Attach listener if header button exists
    const configBtn = document.getElementById('config-btn');
    if (configBtn) {
        configBtn.addEventListener('click', showKeyModal);
    }
}

function hasKey() {
    return !!sessionStorage.getItem('neurograph_api_key');
}

function getKey() {
    return sessionStorage.getItem('neurograph_api_key');
}

function saveKey(key) {
    if (key && key.trim().length > 0) {
        sessionStorage.setItem('neurograph_api_key', key.trim());
        updateKeyStatus();
        closeKeyModal();
        return true;
    }
    return false;
}

function clearKey() {
    sessionStorage.removeItem('neurograph_api_key');
    updateKeyStatus();
}

function updateKeyStatus() {
    const statusEl = document.getElementById('api-key-status');
    if (statusEl) {
        if (hasKey()) {
            const key = getKey();
            if (key === 'demo_simulation') {
                statusEl.textContent = 'Mode: Demo Simulation ✨';
                statusEl.style.color = '#00f0ff';
            } else {
                statusEl.textContent = 'API Key: Set ✓';
                statusEl.style.color = 'var(--success)';
            }
        } else {
            statusEl.textContent = 'API Key: Not set';
            statusEl.style.color = 'var(--error)';
        }
    }
}

function showKeyModal() {
    let modal = document.getElementById('api-key-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'api-key-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal fade-in">
                <h3>Gemini API Configuration</h3>
                <p class="modal-desc">Enter your Google Gemini API key to enable live GraphRAG queries, or test it instantly with the interactive simulator.</p>
                <input type="password" id="api-key-input" placeholder="AIzaSy..." value="${hasKey() && getKey() !== 'demo_simulation' ? '********' : ''}">
                <p class="modal-warning">Your API key is stored only in this browser tab and is never sent to our server for storage.</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap;">
                    <button class="btn" onclick="clearKey(); closeKeyModal()">Clear</button>
                    <button class="btn" style="border-color: #00f0ff; color: #00f0ff;" onclick="saveKey('demo_simulation')">✨ Run Demo Mode</button>
                    <button class="btn btn-primary" onclick="saveKey(document.getElementById('api-key-input').value)">Save Key</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeKeyModal();
        });
    }
    
    setTimeout(() => {
        modal.classList.add('active');
        const input = document.getElementById('api-key-input');
        if (input && !hasKey()) input.focus();
    }, 10);
}

function closeKeyModal() {
    const modal = document.getElementById('api-key-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

window.initProviderConfig = initProviderConfig;
window.showKeyModal = showKeyModal;
window.closeKeyModal = closeKeyModal;
window.saveKey = saveKey;
window.clearKey = clearKey;
window.hasKey = hasKey;
window.getKey = getKey;
