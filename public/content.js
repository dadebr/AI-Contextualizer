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

let iframe = null;

function createIframe() {
    if (iframe) return iframe;

    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('index.html');
    iframe.style.position = 'fixed';
    iframe.style.top = '20px';
    iframe.style.right = '20px';
    iframe.style.width = '400px';
    iframe.style.height = '500px';
    iframe.style.zIndex = '9999';
    iframe.style.border = '1px solid #ccc';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    iframe.style.display = 'none'; // Initially hidden
    document.body.appendChild(iframe);
    return iframe;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GEMINI_ACTION_REQUEST") {
        const modal = createIframe();
        modal.style.display = 'block';
        modal.onload = () => {
            modal.contentWindow.postMessage({
                type: 'GEMINI_ACTION_START',
                action: request.action,
                text: request.text
            }, '*');
        };
    }
});

window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
        return;
    }

    if (event.data.type === 'CLOSE_MODAL') {
        if (iframe) {
            iframe.style.display = 'none';
        }
    }
});
