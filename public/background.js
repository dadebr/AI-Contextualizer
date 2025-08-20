// Function to create context menus
const createContextMenu = () => {
    chrome.contextMenus.create({
        id: "ai-assistant",
        title: "AI Assistant",
        contexts: ["selection"]
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
            id: action.id,
            title: action.title,
            parentId: "ai-assistant",
            contexts: ["selection"]
        });
    });
};

// Create menus when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    createContextMenu();
});

let iframe = null;
let container = null;

const createIframe = () => {
    if (iframe) return;

    container = document.createElement('div');
    container.id = 'gemini-contextualizer-container';
    document.body.appendChild(container);

    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL("index.html");
    iframe.id = "gemini-contextualizer-iframe";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "99999";
    iframe.style.display = "none"; // Initially hidden
    container.appendChild(iframe);

    // Listen for messages from the iframe to close it
    window.addEventListener('message', (event) => {
        if (event.source === iframe.contentWindow && event.data.type === 'CLOSE_MODAL') {
             if (iframe) iframe.style.display = 'none';
        }
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId, selectionText } = info;
    
    // Inject the content script to create the iframe container if it doesn't exist
    chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        function: createIframe
    }).then(() => {
         // Now send the message to the content script
         chrome.tabs.sendMessage(tab.id, {
            type: "GEMINI_ACTION_START",
            action: menuItemId,
            text: selectionText
        });
    });
});
