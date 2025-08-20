# AI Contextualizer

AI Contextualizer is a powerful Chrome extension that leverages generative AI to provide you with contextual actions on any text you select on the web. Right-click on a piece of text to rewrite, summarize, translate, and much more.

## Features

This extension adds an "AI Assistant" menu to your right-click context menu when you select text. The available actions include:

-   **Rewrite Text**: Rephrases the selected text.
-   **Translate Text**: Translates the selected text to a specified language.
-   **Summarize Text**: Provides a concise summary of the selected text.
-   **Review Text**: Checks the selected text for grammar and spelling errors.
-   **Deepen Text**: Expands on the selected text with more detail.
-   **Explain Text**: Explains the selected text in a simple and easy-to-understand way.
-   **Teach How to Use Text**: Provides instructions or examples on how to use the selected text.
-   **Generate Prompt**: Creates a well-structured AI prompt based on the selected text.

## Installation

To install and use this extension, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dadebr/AI-Contextualizer.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd AI-Contextualizer
    ```
3.  **Install the dependencies:**
    ```bash
    npm install
    ```
4.  **Build the extension:**
    ```bash
    npm run build
    ```
5.  **Load the extension in Chrome:**
    -   Open Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode" in the top right corner.
    -   Click on "Load unpacked".
    -   Select the `out` directory from the project folder.

## How to Use

Once the extension is installed, you can use it on any webpage:

1.  **Select text:** Highlight any text on a webpage.
2.  **Right-click:** Right-click on the selected text to open the context menu.
3.  **Choose an action:** Hover over the "AI Assistant" menu item and select one of the available actions.
4.  **View the result:** The result will be displayed in a sidebar on the right side of the page.

## Tech Stack

-   [Next.js](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Genkit](https://firebase.google.com/docs/genkit)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Shadcn UI](https://ui.shadcn.com/)
