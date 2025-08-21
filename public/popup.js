// MV3 não permite scripts inline no popup. Este arquivo implementa o botão que abre a sidebar.

document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.querySelector('.button');
  if (!openBtn) return;

  openBtn.innerHTML = '💬 Abrir AI Assistant';
  openBtn.style.width = '100%';
  openBtn.style.marginTop = '20px';

  openBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      // Primeiro tenta enviar a mensagem diretamente (o content.js já é carregado via manifest)
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_AI_SIDEBAR', text: '' });
      } catch (err) {
        // Se falhar (p.ex. página restrita), tenta injetar e reenviar
        try {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
          await new Promise(r => setTimeout(r, 200));
          await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_AI_SIDEBAR', text: '' });
        } catch (err2) {
          console.error('Falha ao abrir a sidebar:', err2);
        }
      }
    } finally {
      window.close();
    }
  });
});


