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

const AI_ACTIONS = [
    { id: 'rewrite', title: 'Reescrever' },
    { id: 'review', title: 'Revisar' },
    { id: 'deepen', title: 'Aprofundar' },
    { id: 'summarize', title: 'Resumir' },
    { id: 'translate', title: 'Traduzir' },
    { id: 'explain', title: 'Explicar' },
    { id: 'teach', title: 'Ensinar a Usar' },
    { id: 'generatePrompt', title: 'Gerador de Prompt' }
];

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'ai-assistant',
        title: 'AI Assistant',
        contexts: ['selection'],
    });

    AI_ACTIONS.forEach(action => {
        chrome.contextMenus.create({
            id: action.id,
            parentId: 'ai-assistant',
            title: action.title,
            contexts: ['selection'],
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (AI_ACTIONS.some(action => action.id === info.menuItemId)) {
        chrome.tabs.sendMessage(tab.id, {
            type: "GEMINI_ACTION_REQUEST",
            action: info.menuItemId,
            text: info.selectionText
        });
    }
});
