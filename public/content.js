let iframe = null;

function createIframe() {
    if (iframe) return;

    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.style.position = 'fixed';
    iframe.style.top = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '0px'; // Initially hidden
    iframe.style.height = '0px'; // Initially hidden
    iframe.style.zIndex = '9999999';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = 'transparent';
    iframe.style.transition = 'width 0.3s ease, height 0.3s ease';
    iframe.allow = 'clipboard-write';

    document.body.appendChild(iframe);

    // Close iframe if clicked outside
    window.addEventListener('click', (event) => {
        if (iframe && iframe.style.width !== '0px' && !iframe.contains(event.target)) {
            closeIframe();
        }
    }, true);
}


function openIframe() {
    if (!iframe) createIframe();
    // Use a timeout to ensure the iframe is rendered before we resize it
    setTimeout(() => {
        iframe.style.width = 'min(90vw, 725px)';
        iframe.style.height = 'min(90vh, 750px)';
        iframe.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        iframe.style.borderRadius = '0.5rem';
    }, 10);
}

function closeIframe() {
    if (iframe) {
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.boxShadow = 'none';
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GEMINI_ACTION") {
        if (!iframe || iframe.style.width === '0px') {
            openIframe();
        }
        // Use a timeout to ensure iframe is visible before sending the message
        setTimeout(() => {
            iframe.contentWindow.postMessage({
                type: 'GEMINI_ACTION_START',
                action: message.action,
                text: message.text,
            }, '*');
        }, 100);
    } else if (message.type === "CLOSE_MODAL") {
        closeIframe();
    }
});

createIframe();
