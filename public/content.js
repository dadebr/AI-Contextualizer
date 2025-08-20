let iframe = null;
let container = null;

const ensureIframe = () => {
    if (document.getElementById('gemini-contextualizer-iframe')) {
        iframe = document.getElementById('gemini-contextualizer-iframe');
        return;
    }

    container = document.createElement('div');
    container.id = 'gemini-contextualizer-container';
    
    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL("index.html");
    iframe.id = "gemini-contextualizer-iframe";
    iframe.style.width = "400px";
    iframe.style.height = "500px";
    iframe.style.border = "1px solid #ccc";
    iframe.style.borderRadius = "8px";
    iframe.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    iframe.style.position = "fixed";
    iframe.style.top = "20px";
    iframe.style.right = "20px";
    iframe.style.zIndex = "10000";
    iframe.style.display = "none"; // Initially hidden
    
    container.appendChild(iframe);
    document.body.appendChild(container);

     // Listen for messages from the iframe's parent (background script) to close it
    window.addEventListener('message', (event) => {
        if (event.data.type === 'CLOSE_MODAL') {
             if (iframe) {
                iframe.style.display = 'none';
             }
        }
    });
};

// This listener handles messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GEMINI_ACTION_START") {
        ensureIframe();
        if (iframe) {
            iframe.style.display = 'block'; // Show the iframe
            // Wait for the iframe to load before sending the message
            iframe.onload = () => {
                iframe.contentWindow.postMessage({
                    type: "GEMINI_ACTION_START",
                    action: request.action,
                    text: request.text
                }, '*');
            };
            // If already loaded, just send
            if (iframe.contentWindow) {
                 iframe.contentWindow.postMessage({
                    type: "GEMINI_ACTION_START",
                    action: request.action,
                    text: request.text
                }, '*');
            }
        }
    }
    return true; // Indicates that the response is asynchronous
});

// Initial check
ensureIframe();
