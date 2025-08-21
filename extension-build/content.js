// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let sidebar = null;
let sidebarHost = null;
let sidebarShadow = null;
let isProcessing = false;
let currentSelectedText = '';
let currentAction = '';

function createSidebar() {
    if (sidebar) return sidebar;

    // Criar host com Shadow DOM para isolar estilos
    sidebarHost = document.getElementById('ai-contextualizer-host');
    if (!sidebarHost) {
        sidebarHost = document.createElement('div');
        sidebarHost.id = 'ai-contextualizer-host';
        sidebarHost.style.all = 'initial';
        sidebarHost.style.position = 'fixed';
        sidebarHost.style.top = '0';
        sidebarHost.style.right = '0';
        sidebarHost.style.zIndex = '2147483646';
        document.documentElement.appendChild(sidebarHost);
    }
    sidebarShadow = sidebarHost.shadowRoot || sidebarHost.attachShadow({ mode: 'open' });

    // Criar container da sidebar
    sidebar = document.createElement('div');
    sidebar.id = 'ai-contextualizer-sidebar';
    sidebar.innerHTML = `
        <div class="ai-sidebar-header">
            <div class="ai-sidebar-title">
                <img src="${chrome.runtime.getURL('icon48.png')}" alt="AI Assistant" class="ai-icon">
                <h3>AI Assistant</h3>
            </div>
            <div class="ai-model-indicator" id="modelIndicator" title="Modelo em uso"></div>
            <button class="ai-close-btn" title="Fechar">×</button>
        </div>
        <div class="ai-sidebar-content">
            <div class="ai-tabs">
                <button class="ai-tab-btn active" data-tab="actions">Ações</button>
                <button class="ai-tab-btn" data-tab="saved">Salvos</button>
            </div>

            <div class="ai-tab-content active" data-tab="actions">
                <div class="ai-actions-section">
                    <label>Escolha uma ação:</label>
                    <div class="ai-actions-menu">
                        <button class="ai-action-btn" data-action="rewrite">Reescrever</button>
                        <button class="ai-action-btn" data-action="review">Revisar</button>
                        <button class="ai-action-btn" data-action="deepen">Aprofundar</button>
                        <button class="ai-action-btn" data-action="summarize">Resumir</button>
                        <button class="ai-action-btn" data-action="translate">Traduzir</button>
                        <button class="ai-action-btn" data-action="explain">Explicar</button>
                        <button class="ai-action-btn" data-action="teach">Ensinar a Usar</button>
                        <button class="ai-action-btn" data-action="generatePrompt">Gerador de Prompt</button>
                        <button class="ai-action-btn" data-action="search">Pesquisar</button>
                        <button class="ai-action-btn" data-action="ask">Perguntar</button>
                    </div>
                </div>
                <div class="ai-ask-section" style="display: none;">
                    <label>Digite sua pergunta:</label>
                    <textarea class="ai-ask-input" id="askInput" placeholder="Ex: Qual é a capital da França?" rows="3"></textarea>
                    <button class="ai-ask-btn" id="sendAskBtn">Enviar Pergunta</button>
                </div>
                <div class="ai-loading" style="display: none;">
                    <div class="ai-spinner"></div>
                    <p>Processando sua solicitação...</p>
                </div>
                <div class="ai-result" style="display: none;">
                    <div class="ai-input-section">
                        <label>Texto selecionado:</label>
                        <div class="ai-selected-text" id="selectedText"></div>
                    </div>
                    <div class="ai-output-section">
                        <label>Resultado:</label>
                        <div class="ai-result-text" id="resultText"></div>
                    </div>
                </div>
            </div>

            <div class="ai-tab-content" data-tab="saved">
                <div class="ai-saved-section">
                    <label>Respostas Salvas:</label>
                    <div class="ai-saved-list" id="savedList">
                        <p style="text-align: center; color: rgba(255,255,255,0.6); margin: 20px 0;">
                            Nenhuma resposta salva ainda
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="ai-sidebar-footer">
            <button class="ai-footer-btn" id="copyBtn" title="Copiar resultado">📋 Copiar</button>
            <button class="ai-footer-btn" id="injectBtn" title="Inserir no local original">💉 Injetar</button>
            <button class="ai-footer-btn" id="saveBtn" title="Salvar resposta">💾 Salvar</button>
        </div>
    `;

    // Adicionar estilos CSS
    const style = document.createElement('style');
    style.textContent = `
        #ai-contextualizer-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: min(420px, 35vw);
            height: 100dvh;
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            box-shadow: -4px 0 20px rgba(0,0,0,0.4);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease, margin-right 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            color: #ffffff;
            margin-right: 10px;
            margin-top: 10px;
            margin-bottom: 10px;
            border-radius: 12px 0 0 12px;
            height: calc(100vh - 20px);
        }

        #ai-contextualizer-sidebar.open {
            transform: translateX(0);
            margin-right: 0;
        }

        /* margem visual aplicada por classe externa no html/body */

        .ai-sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
            background: linear-gradient(135deg, #3949ab 0%, #1e88e5 100%);
        }

        .ai-sidebar-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-icon {
            width: 24px;
            height: 24px;
        }

        .ai-sidebar-title h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .ai-close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            color: #e3f2fd;
            transition: color 0.2s;
        }

        .ai-close-btn:hover {
            color: #ffffff;
        }

        .ai-sidebar-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .ai-tabs {
            display: flex;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 4px;
            gap: 4px;
            margin-bottom: 16px;
            flex-shrink: 0;
        }

        .ai-tab-btn {
            flex: 1;
            background: none;
            border: none;
            color: rgba(255,255,255,0.7);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .ai-tab-btn.active {
            background: rgba(255,255,255,0.2);
            color: #ffffff;
        }

        .ai-tab-content {
            display: none;
            flex: 1;
            overflow-y: auto;
        }

        .ai-tab-content.active {
            display: block;
        }

        .ai-ask-section {
            flex-shrink: 0;
        }

        .ai-ask-input {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            background: rgba(255,255,255,0.1);
            color: #ffffff;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
        }

        .ai-ask-input:focus {
            outline: none;
            border-color: #90caf9;
            box-shadow: 0 0 0 3px rgba(144,202,249,0.2);
        }

        .ai-ask-btn {
            background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 8px;
            width: 100%;
        }

        .ai-ask-btn:hover {
            background: linear-gradient(135deg, #64b5f6 0%, #1565c0 100%);
            transform: translateY(-1px);
        }

        .ai-saved-section {
            flex: 1;
        }

        .ai-saved-list {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 8px;
        }

        .ai-saved-item {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .ai-saved-item:hover {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.3);
        }

        .ai-saved-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .ai-saved-item-action {
            font-size: 10px;
            color: rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }

        .ai-saved-item-time {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
        }

        .ai-saved-item-text {
            font-size: 12px;
            color: rgba(255,255,255,0.8);
            line-height: 1.4;
            max-height: 80px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
        }

        .ai-saved-list::-webkit-scrollbar {
            width: 4px;
        }

        .ai-saved-list::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
        }

        .ai-saved-list::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
        }

        .ai-actions-section {
            flex-shrink: 0;
            margin-bottom: 8px;
        }

        .ai-actions-section label {
            display: block;
            font-weight: 600;
            margin-bottom: 12px;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .ai-actions-menu {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
            padding-right: 8px;
        }

        .ai-actions-menu::-webkit-scrollbar {
            width: 4px;
        }

        .ai-actions-menu::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
        }

        .ai-actions-menu::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
        }

        .ai-action-btn {
            background: rgba(255,255,255,0.1);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .ai-action-btn:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.4);
            transform: translateY(-1px);
        }

        .ai-action-btn:active {
            background: rgba(255,255,255,0.3);
        }

        .ai-sidebar-footer {
            flex-shrink: 0;
            padding: 16px;
            border-top: 1px solid rgba(255,255,255,0.2);
            display: flex;
            gap: 8px;
        }

        .ai-footer-btn {
            flex: 1;
            background: rgba(255,255,255,0.1);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.2);
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .ai-footer-btn:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.4);
            transform: translateY(-1px);
        }

        .ai-footer-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .ai-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #e3f2fd;
        }

        .ai-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid #42a5f5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .ai-input-section, .ai-output-section {
            margin-bottom: 16px;
        }

        .ai-input-section label, .ai-output-section label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .ai-selected-text, .ai-result-text {
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 6px;
            background: rgba(255,255,255,0.1);
            color: #ffffff;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
            max-height: 150px;
            overflow-y: auto;
            backdrop-filter: blur(10px);
        }

        .ai-result-text {
            background: rgba(255,255,255,0.15);
            min-height: 100px;
        }

        .ai-model-indicator {
            background: rgba(255,255,255,0.1);
            color: #90caf9;
            font-size: 10px;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
            font-weight: 500;
            text-align: center;
            min-width: 80px;
        }
    `;
    // Injetar estilos no shadow root (não no head da página)
    sidebarShadow.appendChild(style);

    // Adicionar event listeners
    sidebar.querySelector('.ai-close-btn').addEventListener('click', closeSidebar);

    // Event listeners para as tabs
    const tabButtons = sidebar.querySelectorAll('.ai-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    // Event listeners para os botões de ação
    const actionButtons = sidebar.querySelectorAll('.ai-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = button.dataset.action;

            // Para "ask", mostrar seção de perguntar
            if (action === 'ask') {
                showAskSection();
            } else if (currentSelectedText) {
                processAction(action, currentSelectedText);
            } else {
                const resEl = sidebar.querySelector('#resultText');
                if (resEl) resEl.textContent =
                    'Por favor, selecione um texto antes de usar esta função.';
            }
        });
    });

    // Event listener para o botão de enviar pergunta
    const sendAskBtn = sidebar.querySelector('#sendAskBtn');
    if (sendAskBtn) {
        sendAskBtn.addEventListener('click', () => {
            const askInput = sidebar.querySelector('#askInput');
            const question = askInput.value.trim();
            if (question) {
                processAction('ask', question);
                hideAskSection();
                askInput.value = '';
            }
        });
    }

    // Event listeners para os botões do footer
    const copyBtn = sidebar.querySelector('#copyBtn');
    const injectBtn = sidebar.querySelector('#injectBtn');

    copyBtn.addEventListener('click', () => {
        const resultEl = sidebar.querySelector('#resultText');
        const resultText = resultEl ? resultEl.textContent : '';
        if (resultText) {
            navigator.clipboard.writeText(resultText).then(() => {
                copyBtn.textContent = '✅ Copiado!';
                copyBtn.style.background = 'rgba(76,175,80,0.3)';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copiar';
                    copyBtn.style.background = 'rgba(255,255,255,0.1)';
                }, 2000);
            });
        }
    });

    injectBtn.addEventListener('click', () => {
        const resultText = sidebar.querySelector('#resultText').textContent;
        if (resultText && currentSelectedText) {
            injectText(resultText);
            injectBtn.textContent = '✅ Injetado!';
            injectBtn.style.background = 'rgba(76,175,80,0.3)';
            setTimeout(() => {
                injectBtn.innerHTML = '💉 Injetar';
                injectBtn.style.background = 'rgba(255,255,255,0.1)';
            }, 2000);
        }
    });

    const saveBtn = sidebar.querySelector('#saveBtn');
    saveBtn.addEventListener('click', () => {
        const resultEl = sidebar.querySelector('#resultText');
        const resultText = resultEl ? resultEl.textContent : '';
        if (resultText) {
            saveResponse(resultText, currentAction);
            saveBtn.textContent = '✅ Salvo!';
            saveBtn.style.background = 'rgba(76,175,80,0.3)';
            setTimeout(() => {
                saveBtn.innerHTML = '💾 Salvar';
                saveBtn.style.background = 'rgba(255,255,255,0.1)';
            }, 2000);
        }
    });

    sidebarShadow.appendChild(sidebar);
    return sidebar;
}

function injectText(text) {
    // Tentar injetar o texto no campo de entrada ativo
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        activeElement.value = text;
        return;
    }

    // Se não há campo ativo, tentar substituir a seleção atual
    if (window.getSelection) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    }
}

function saveResponse(text, action) {
    if (!text || text.trim() === '') {
        console.warn('Tentativa de salvar texto vazio');
        return;
    }

    // Buscar respostas salvas existentes
    chrome.storage.local.get(['savedResponses'], function(result) {
        const savedResponses = result.savedResponses || [];
        const timestamp = new Date().toLocaleString('pt-BR');

        // Adicionar nova resposta
        const newResponse = {
            id: Date.now().toString(),
            text: text.trim(),
            action: action,
            originalText: currentSelectedText || '',
            timestamp: timestamp
        };

        savedResponses.unshift(newResponse);

        // Manter apenas as últimas 50 respostas
        if (savedResponses.length > 50) {
            savedResponses.splice(50);
        }

        // Salvar no chrome.storage
        chrome.storage.local.set({
            savedResponses: savedResponses
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Erro ao salvar resposta:', chrome.runtime.lastError);
            } else {
                console.log('Resposta salva com sucesso:', newResponse);
                // Atualizar lista se a aba "Salvos" estiver ativa
                const savedContent = sidebar && sidebar.querySelector('.ai-tab-content[data-tab="saved"]');
                if (savedContent && savedContent.classList.contains('active')) {
                    loadSavedResponses();
                }
            }
        });
    });
}

function switchTab(tabName) {
    if (!sidebar) return;
    const tabButtons = sidebar.querySelectorAll('.ai-tab-btn');
    const tabContents = sidebar.querySelectorAll('.ai-tab-content');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const activeButton = sidebar.querySelector(`.ai-tab-btn[data-tab="${tabName}"]`);
    const activeContent = sidebar.querySelector(`.ai-tab-content[data-tab="${tabName}"]`);

    if (activeButton) activeButton.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    if (tabName === 'saved') {
        loadSavedResponses();
    }
}

function showAskSection() {
    const actionsSection = sidebar.querySelector('.ai-actions-section');
    const askSection = sidebar.querySelector('.ai-ask-section');

    if (actionsSection) actionsSection.style.display = 'none';
    if (askSection) askSection.style.display = 'block';
}

function hideAskSection() {
    const actionsSection = sidebar.querySelector('.ai-actions-section');
    const askSection = sidebar.querySelector('.ai-ask-section');

    if (actionsSection) actionsSection.style.display = 'block';
    if (askSection) askSection.style.display = 'none';
}

function loadSavedResponses() {
    const savedList = sidebar.querySelector('#savedList');
    if (!savedList) return;

    chrome.storage.local.get(['savedResponses'], function(result) {
        const savedResponses = result.savedResponses || [];

        if (savedResponses.length === 0) {
            savedList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); margin: 20px 0;">Nenhuma resposta salva ainda</p>';
            return;
        }

        savedList.innerHTML = '';

        savedResponses.forEach(response => {
            const item = document.createElement('div');
            item.className = 'ai-saved-item';
            item.innerHTML = `
                <div class="ai-saved-item-header">
                    <span class="ai-saved-item-action">${getActionName(response.action)}</span>
                    <span class="ai-saved-item-time">${response.timestamp}</span>
                </div>
                <div class="ai-saved-item-text">${response.text}</div>
            `;

            item.addEventListener('click', () => {
                // Preencher o resultado com a resposta salva
                document.getElementById('resultText').textContent = response.text;
                document.getElementById('selectedText').textContent = response.originalText || 'Texto original não disponível';

                // Mostrar seção de resultado
                const resultSection = sidebar.querySelector('.ai-result');
                if (resultSection) resultSection.style.display = 'block';

                // Mudar para a aba de ações
                switchTab('actions');
            });

            savedList.appendChild(item);
        });
    });
}

function getActionName(action) {
    const actionNames = {
        'rewrite': 'Reescrever',
        'review': 'Revisar',
        'deepen': 'Aprofundar',
        'summarize': 'Resumir',
        'translate': 'Traduzir',
        'explain': 'Explicar',
        'teach': 'Ensinar',
        'generatePrompt': 'Gerar Prompt',
        'search': 'Pesquisar',
        'ask': 'Perguntar'
    };
    return actionNames[action] || action;
}

function openSidebar() {
    const sidebar = createSidebar();
    sidebar.classList.add('open');
    // Evita mexer em estilos do site; adiciona uma leve margem via classe dedicada
    document.documentElement.classList.add('ai-contextualizer-shift');
    document.body.classList.add('ai-contextualizer-shift');

    // Mostrar seção de ações e esconder resultado por padrão
    const actionsSection = sidebar.querySelector('.ai-actions-section');
    const resultSection = sidebar.querySelector('.ai-result');

    if (actionsSection) actionsSection.style.display = 'block';
    if (resultSection) resultSection.style.display = 'none';

    // Carregar respostas salvas
    loadSavedResponses();
    
    // Carregar e exibir o modelo atual
    loadCurrentModel();
}

function closeSidebar() {
    if (sidebar) {
        sidebar.classList.remove('open');
        document.documentElement.classList.remove('ai-contextualizer-shift');
        document.body.classList.remove('ai-contextualizer-shift');
    }
}

function showLoading() {
    const loading = sidebar.querySelector('.ai-loading');
    const actions = sidebar.querySelector('.ai-actions-section');
    const result = sidebar.querySelector('.ai-result');

    if (loading) loading.style.display = 'flex';
    if (actions) actions.style.display = 'none';
    if (result) result.style.display = 'none';
}

function hideLoading() {
    const loading = sidebar.querySelector('.ai-loading');
    const actions = sidebar.querySelector('.ai-actions-section');
    const result = sidebar.querySelector('.ai-result');

    if (loading) loading.style.display = 'none';
    if (actions) actions.style.display = 'block'; // Menu permanece visível
    if (result) result.style.display = 'block';
}

function loadCurrentModel() {
    chrome.storage.sync.get(['model'], function(result) {
        const model = result.model || 'gemini-2.5-flash';
        const modelIndicator = sidebar.querySelector('#modelIndicator');
        if (modelIndicator) {
            // Formatar o nome do modelo para exibição
            const modelDisplay = model.replace('gemini-', 'Gemini ').replace('-', ' ');
            modelIndicator.textContent = modelDisplay;
            modelIndicator.title = `Modelo atual: ${model}`;
        }
    });
}

// Mapeamento das ações para prompts profissionais seguindo as especificações
const ACTION_PROMPTS = {
    'rewrite': `Reescreva o texto abaixo preservando o sentido original, melhorando clareza e fluidez. Mantenha formatação básica como listas e links.

IMPORTANTE: Retorne APENAS o texto reescrito, sem explicações, introduções ou comentários adicionais.

Texto para reescrever:
{{SELECAO}}

Texto reescrito:`,

    'review': `Revise o texto abaixo corrigindo erros de gramática, ortografia e estilo. Melhore a clareza e fluidez mantendo o sentido original.

IMPORTANTE: Retorne APENAS o texto revisado, sem explicações, introduções ou comentários adicionais sobre as correções feitas.

Texto para revisar:
{{SELECAO}}

Texto revisado:`,

    'deepen': `Você é um especialista de domínio. Objetivo: expandir o conteúdo abaixo com maior profundidade analítica, mantendo o tema central e os fatos.
Inclua: (1) contexto essencial; (2) 2–3 implicações práticas; (3) 1 contrargumento relevante e respectiva refutação; (4) checklist/boas práticas; (5) (opcional) métricas ou exemplos numéricos plausíveis, marcando-os como "exemplo ilustrativo".
Não adicione afirmações factuais novas sem sinalizar fonte implícita ("literatura padrão", "normas setoriais") ou marcar como hipótese.
Idioma: {{IDIOMA_SAIDA}}. Tom: {{TOM}}. Público: {{PUBLICO}}. Comprimento: {{COMPRIMENTO}}.
Política: não inventar fatos; preservar números, citações e referências; manter marcações/links e a estrutura lógica; detectar o idioma da seleção quando {{IDIOMA_SAIDA}} não for informado; responder somente com o que for solicitado, sem cadeia de raciocínio.
Base:
{{SELECAO}}
Saída: seção "Contexto", "Implicações", "Contraponto", "Boas práticas", "Conclusão executiva".`,

    'summarize': `Resuma o conteúdo abaixo em bullets objetivos, sem opinião, mantendo números e nomes próprios.
Estruture em 3 blocos:
1) Essência (5 bullets máx.),
2) Dados/achados críticos (3–6 bullets com números),
3) Próximos passos/recomendações (até 5 bullets, verbos no infinitivo).
Se {{COMPRIMENTO}}=curto, limite a 7 bullets no total.
Idioma: {{IDIOMA_SAIDA}}. Público: {{PUBLICO}}. Tom: {{TOM}}.
Política: não inventar fatos; preservar números, citações e referências; manter marcações/links e a estrutura lógica; detectar o idioma da seleção quando {{IDIOMA_SAIDA}} não for informado; responder somente com o que for solicitado, sem cadeia de raciocínio.
Texto:
{{SELECAO}}
Saída: apenas os bullets.`,

    'translate': `Traduza o texto a seguir para o Inglês, preservando marcações (listas, **negrito**, _itálico_, links), números e nomes próprios.
Não interprete; não resuma; não explique. Se houver termos técnicos, mantenha o termo original entre parênteses na primeira ocorrência.
Se houver trechos intraduzíveis (código, comandos), mantenha-os como estão.
Política: não inventar fatos; preservar números, citações e referências; manter marcações/links e a estrutura lógica; detectar o idioma da seleção quando {{IDIOMA_SAIDA}} não for informado; responder somente com o que for solicitado, sem cadeia de raciocínio.
Texto:
{{SELECAO}}
Saída: tradução fiel formatada.`,

    'explain': `Explique o conteúdo abaixo de forma didática para o público {{PUBLICO}}, no tom {{TOM}}, em {{IDIOMA_SAIDA}}.
Forneça:
1) "Ideia central" (2–3 frases),
2) "Como funciona" (passo a passo numerado),
3) "Exemplo prático" (curto),
4) "Erros comuns e como evitar",
5) "Resumo em 3 bullets".
Evite jargões não definidos. Não invente fatos fora do texto; quando necessário, trate como hipótese.
Política: não inventar fatos; preservar números, citações e referências; manter marcações/links e a estrutura lógica; detectar o idioma da seleção quando {{IDIOMA_SAIDA}} não for informado; responder somente com o que for solicitado, sem cadeia de raciocínio.
Conteúdo:
{{SELECAO}}
Saída: seções conforme solicitado.`,

    'teach': `Produza um guia de uso operacional, em {{IDIOMA_SAIDA}}, para o público {{PUBLICO}} e tom {{TOM}}, a partir do conteúdo abaixo.
Entregáveis:
- Pré-requisitos (lista)
- Passo a passo (1,2,3… com subetapas)
- Checklist de verificação
- Troubleshooting (3–6 problemas → causa provável → solução)
- Critérios de sucesso (KPIs/aceitação)
Mantenha comandos, teclas e nomes de menu exatamente como no original; se houver variações de sistema, indique alternativas.
Política: não inventar fatos; preservar números, citações e referências; manter marcações/links e a estrutura lógica; detectar o idioma da seleção quando {{IDIOMA_SAIDA}} não for informado; responder somente com o que for solicitado, sem cadeia de raciocínio.
Base:
{{SELECAO}}
Saída: guia pronto para execução.`,

    'generatePrompt': `Com base no texto abaixo, crie um prompt de IA bem estruturado e detalhado.

IMPORTANTE: Retorne APENAS o prompt gerado, sem explicações, introduções ou comentários adicionais.

Texto base:
{{SELECAO}}

Prompt gerado:`,

    'ask': `Você é um assistente de IA útil e inteligente. Responda à pergunta abaixo de forma clara, precisa e útil.

IMPORTANTE: Forneça uma resposta direta e completa à pergunta, sem explicações sobre como você está respondendo.

Pergunta:
{{SELECAO}}

Resposta:`,

    'search': `Com base no texto/contexto fornecido, pesquise e forneça informações adicionais relevantes sobre o assunto. Inclua fatos, dados e insights que complementem o conteúdo original.

IMPORTANTE: Forneça apenas as informações pesquisadas, sem introduções ou explicações sobre a pesquisa em si.

Contexto/Texto base:
{{SELECAO}}

Informações adicionais:`
};

async function processTextWithAPI(action, text) {
    return new Promise((resolve, reject) => {
        // Buscar configurações do chrome.storage
        chrome.storage.sync.get(['apiKey', 'model'], async function(result) {
            if (chrome.runtime.lastError) {
                reject(new Error('Erro ao acessar configurações: ' + chrome.runtime.lastError.message));
                return;
            }

            const apiKey = result.apiKey;
            const model = result.model || 'gemini-2.5-flash';

            if (!apiKey) {
                reject(new Error('Chave da API não configurada. Por favor, configure nas opções da extensão.'));
                return;
            }

            // Validar se o modelo escolhido é suportado
            const supportedModels = [
                'gemini-2.5-flash-lite',
                'gemini-2.5-flash', 
                'gemini-2.5-pro',
                'gemini-2.0-flash',
                'gemini-1.5-flash'
            ];
            
            if (!supportedModels.includes(model)) {
                reject(new Error(`Modelo '${model}' não é suportado. Use um dos modelos disponíveis nas opções.`));
                return;
            }

            try {
                // Substituir placeholders pelos valores padrão
                let prompt = ACTION_PROMPTS[action] || 'Process the following text:';

                // Fallbacks conforme especificado
                const fallbacks = {
                    '{{IDIOMA_SAIDA}}': 'pt-BR',
                    '{{TOM}}': 'profissional',
                    '{{COMPRIMENTO}}': 'médio',
                    '{{PUBLICO}}': 'técnico',
                    '{{DIAGNOSTICO}}': 'não',
                    '{{VARIANTES}}': '1',
                    '{{FOCO}}': 'clareza'
                };

                // Substituir placeholders
                Object.keys(fallbacks).forEach(placeholder => {
                    prompt = prompt.replace(new RegExp(placeholder, 'g'), fallbacks[placeholder]);
                });

                // Substituir o texto selecionado
                const fullPrompt = prompt.replace('{{SELECAO}}', text);

                console.log(`Usando modelo: ${model}`); // Log para debug

                // Fazer chamada direta para a API do Google AI
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: fullPrompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048,
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const resultText = data.candidates[0].content.parts[0].text;
                    resolve({
                        success: true,
                        result: resultText,
                        action: action,
                        originalText: text,
                        model: model // Retorna o modelo usado para confirmação
                    });
                } else {
                    throw new Error('Resposta inválida da API');
                }

            } catch (error) {
                console.error('Erro ao chamar API do Google AI:', error);
                reject(error);
            }
        });
    });
}

function processAction(action, text) {
    if (isProcessing) return;

    currentAction = action;

    // Para a função "ask", permitir texto vazio
    if (action === 'ask') {
        currentSelectedText = text || 'Olá, como posso te ajudar?';
    } else {
        if (!text || text.trim() === '') {
            document.getElementById('resultText').textContent =
                'Por favor, selecione um texto antes de usar esta função.';
            return;
        }
        currentSelectedText = text;
    }

    isProcessing = true;
    showLoading();

    // Exibir texto selecionado (ou mensagem para ask)
    if (action === 'ask') {
        const selEl = sidebar.querySelector('#selectedText');
        if (selEl) selEl.textContent = text || 'Modo de conversa - digite sua pergunta';
    } else {
        const selEl = sidebar.querySelector('#selectedText');
        if (selEl) selEl.textContent = text;
    }

    // Fazer chamada real para a API
    processTextWithAPI(action, text)
        .then(result => {
            hideLoading();
            isProcessing = false;

            if (result.success && result.result) {
                const resEl = sidebar.querySelector('#resultText');
                if (resEl) resEl.textContent = result.result;
                // Atualizar o indicador de modelo
                const modelIndicator = sidebar.querySelector('#modelIndicator');
                if (modelIndicator) {
                    modelIndicator.textContent = `Modelo: ${result.model}`;
                }
            } else {
                const resEl = sidebar.querySelector('#resultText');
                if (resEl) resEl.textContent = 'Erro: Resposta inválida da API';
            }
        })
        .catch(error => {
            hideLoading();
            isProcessing = false;
            const resEl = sidebar.querySelector('#resultText');
            if (resEl) resEl.textContent =
                `Erro ao processar texto: ${error.message}\n\n` +
                'Verifique se:\n' +
                '1. A chave da API está configurada nas opções da extensão\n' +
                '2. O modelo selecionado está disponível\n' +
                '3. Não há problemas de conectividade';
        });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "OPEN_AI_SIDEBAR") {
        currentSelectedText = request.text;
        openSidebar();

        // Exibir texto selecionado na seção de input
        const selectedTextElement = sidebar.querySelector('#selectedText');
        if (selectedTextElement) selectedTextElement.textContent = request.text;
    }
});
