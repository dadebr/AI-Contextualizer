// Function to create context menus
const createContextMenu = () => {
  // Ensure we don't create duplicate menus
  chrome.contextMenus.removeAll(() => {
    const parent = chrome.contextMenus.create({
      id: "gemini-contextualizer-parent",
      title: "AI Assistant",
      contexts: ["selection"],
    });

    const actions = [
      { id: 'rewrite', title: 'Reescrever' },
      { id: 'review', title: 'Revisar' },
      { id: 'deepen', title: 'Aprofundar' },
      { id: 'summarize', title: 'Resumir' },
      { id: 'translate', title: 'Traduzir' },
      { id: 'explain', title: 'Explicar' },
      { id: 'teach', title: 'Ensinar a Usar' },
      { id: 'generatePrompt', title: 'Gerador de Prompt' }
    ];

    actions.forEach(action => {
      chrome.contextMenus.create({
        id: `gemini-contextualizer-${action.id}`,
        parentId: parent,
        title: action.title,
        contexts: ["selection"],
      });
    });
  });
};

// Create menus on install
chrome.runtime.onInstalled.addListener(createContextMenu);
// Recreate menus on startup
chrome.runtime.onStartup.addListener(createContextMenu);


chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = info.menuItemId.toString().replace('gemini-contextualizer-', '');
  const selectedText = info.selectionText;

  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, {
        type: "GEMINI_ACTION",
        action: action,
        text: selectedText
    });
  }
});
