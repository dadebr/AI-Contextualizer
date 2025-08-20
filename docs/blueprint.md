# **App Name**: Gemini Contextualizer

## Core Features:

- API Key Configuration: Allow the user to set their Google AI Studio API key via a settings page.
- Model Selection: Let users select from available Gemini models (gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.5-pro).
- Context Menu Integration: Add 'AI Assistant' option to the context menu upon text selection.
- Rewrite Text: Use the tool to allow users to rewrite the selected text to improve clarity, tone, or style, then show the re-written text in a modal.
- Translate Text: Use the tool to translate selected text to the browser's default language, then display it in a modal.
- Review Text: Use the tool to review and correct grammar/spelling in selected text, and show revised text in a modal.
- Summarize Text: Employ Gemini to generate a concise summary of the selected text, and display the summary in a modal.

## Style Guidelines:

- Primary color: HSL(220, 70%, 50%) - A vibrant, yet professional blue (#3D85C6) to convey trust and intelligence.
- Background color: HSL(220, 20%, 95%) - A very light desaturated blue (#F0F4F8) provides a clean and unobtrusive backdrop.
- Accent color: HSL(190, 60%, 45%) - A contrasting, bright turquoise (#45B8AC) for interactive elements to highlight key actions.
- Font: 'Inter', a sans-serif font, known for its modern and clean appearance, making it suitable for both headers and body text. Note: currently only Google Fonts are supported.
- Use simple, clear icons from a consistent set, related to text manipulation actions like rewriting, summarizing, etc.
- The modal should have a clean and structured layout, clearly distinguishing between the original text, action performed, and AI-generated result.
- Use subtle animations, such as a spinner or progress bar, to indicate loading states when communicating with the Gemini API.