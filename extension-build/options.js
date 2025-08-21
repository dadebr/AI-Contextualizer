// Carregar configurações salvas
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();

    // Event listener para salvar configurações
    document.getElementById('saveButton').addEventListener('click', saveSettings);
});

// Carregar configurações do chrome.storage
function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'model'], function(result) {
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
        if (result.model) {
            document.getElementById('model').value = result.model;
        }
    });
}

// Salvar configurações no chrome.storage
function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const model = document.getElementById('model').value;
    const saveButton = document.getElementById('saveButton');
    const messageDiv = document.getElementById('message');

    // Validações
    if (!apiKey) {
        showMessage('Por favor, digite sua chave da API do Google AI.', 'error');
        return;
    }

    if (!model) {
        showMessage('Por favor, selecione um modelo.', 'error');
        return;
    }

    // Desabilitar botão durante o salvamento
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';

    // Salvar no chrome.storage
    chrome.storage.sync.set({
        apiKey: apiKey,
        model: model
    }, function() {
        if (chrome.runtime.lastError) {
            showMessage('Erro ao salvar configurações: ' + chrome.runtime.lastError.message, 'error');
            saveButton.disabled = false;
            saveButton.textContent = 'Salvar Configurações';
        } else {
            showMessage('Configurações salvas com sucesso!', 'success');

            // Reabilitar botão após um tempo
            setTimeout(() => {
                saveButton.disabled = false;
                saveButton.textContent = 'Salvar Configurações';
            }, 2000);
        }
    });
}

// Mostrar mensagens para o usuário
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');

    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Auto-hide após 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Função para testar a API key (opcional)
async function testApiKey(apiKey, model) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Hello'
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Erro ao testar API key:', error);
        return false;
    }
}
