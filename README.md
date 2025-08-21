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
    -   Select the `extension-build` directory from the project folder.

6.  **Configure the extension:**
    -   After loading, click on the extension icon in your browser toolbar
    -   Click on "Configurações da extensão" or go to `chrome://extensions/`, find the extension, and click on "Details" → "Extension options"
    -   Enter your Google AI API key
    -   Select your preferred AI model
    -   Click "Salvar Configurações"

## Requirements

Before using this extension, make sure you have:

- ✅ Google AI API Key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))
- ✅ Chrome browser for testing the extension

## How to Use

Once the extension is installed and configured, you can use it on any webpage:

1.  **Configure your API key:**
    - Open the extension options page
    - Enter your Google AI API key
    - Select your preferred AI model
    - Click "Salvar Configurações"

2.  **Select text:** Highlight any text on a webpage.

3.  **Right-click:** Right-click on the selected text to open the context menu.

4.  **Choose an action:** Hover over the "AI Assistant" menu item and select one of the available actions:
    - Rewrite Text
    - Translate Text
    - Summarize Text
    - Review Text
    - Deepen Text
    - Explain Text
    - Teach How to Use Text
    - Generate Prompt

5.  **View the result:** A sidebar will open on the right side of the page showing:
    - The original selected text
    - The AI-generated result for your chosen action
    - Loading indicator while processing
    - Option to close the sidebar

## Features

This extension adds an "AI Assistant" menu to your right-click context menu when you select text. The available actions include:

-   **Rewrite Text**: Rephrases the selected text.
-   **Translate Text**: Translates the selected text to English.
-   **Summarize Text**: Provides a concise summary of the selected text.
-   **Review Text**: Checks the selected text for grammar and spelling errors.
-   **Deepen Text**: Expands on the selected text with more detail.
-   **Explain Text**: Explains the selected text in a simple and easy-to-understand way.
-   **Teach How to Use Text**: Provides instructions or examples on how to use the selected text.
-   **Generate Prompt**: Creates a well-structured AI prompt based on the selected text.

**Note:** The extension works independently once configured with your Google AI API key. No server required!

## Tech Stack

-   [Next.js](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Genkit](https://firebase.google.com/docs/genkit)
-   [Google AI](https://ai.google.dev/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Shadcn UI](https://ui.shadcn.com/)

## Troubleshooting

### Extension not working

1. **Check if Next.js app is running:**
   ```bash
   npm run dev
   ```
   The app should be accessible at `http://localhost:3000`

2. **Verify API key:**
   - Make sure `.env.local` exists with `GOOGLE_GENAI_API_KEY=your-key`
   - Test the API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Reload the extension:**
   - Go to `chrome://extensions`
   - Find "AI Contextualizer" and click the reload button

### Common Errors

**"Failed to fetch" error:**
- Make sure Next.js app is running on port 3000
- Check if there are CORS issues (the API is configured to allow all origins)

**"Erro interno do servidor" (Internal server error):**
- Check Next.js console for error messages
- Verify Google AI API key is valid and has credits
- Test the API endpoint directly: `POST http://localhost:3000/api/process-text`

**No context menu appears:**
- Make sure text is selected before right-clicking
- Reload the extension in Chrome
- Check browser console for errors

**Sidebar not opening:**
- Check browser console for JavaScript errors
- Make sure the content script is loaded (check Network tab)

### Getting Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the key and add it to your `.env.local` file

### Available AI Models

The extension supports the latest Gemini models:

- **Gemini 2.5 Flash** (Recommended): Fastest, optimized for general tasks
- **Gemini 2.5 Pro**: Best quality and advanced reasoning
- **Gemini 2.5 Flash Lite**: Lightest version of Flash, even faster
- **Gemini 2.0/1.5**: Legacy models, still functional

### Development Tips

- Use browser developer tools to debug extension issues
- Check the Console tab for errors
- Use the Network tab to monitor API calls
- Test API calls directly using [Google AI Studio](https://makersuite.google.com/app/apikey)

### API Documentation

For detailed API information, see [API_OPTIONS.md](API_OPTIONS.md) which explains:
- Different API options (own API vs direct browser calls)
- Security considerations
- Configuration details
- Troubleshooting guide
