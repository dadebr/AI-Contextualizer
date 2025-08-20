"use server";

import { rewriteText } from '@/ai/flows/rewrite-text';
import { translateText } from '@/ai/flows/translate-text';
import { reviewText } from '@/ai/flows/review-text';
import { summarizeText } from '@/ai/flows/summarize-text';
import { deepenText } from '@/ai/flows/deepen-text';
import { explainText } from '@/ai/flows/explain-text';
import { teachHowToUseText } from '@/ai/flows/teach-how-to-use-text';
import { generatePrompt } from '@/ai/flows/generate-prompt';

export type AiAction = 'rewrite' | 'translate' | 'review' | 'summarize' | 'deepen' | 'explain' | 'teach' | 'generatePrompt';

export async function performAiAction(
  action: AiAction,
  text: string,
  targetLanguage?: string
): Promise<{ result?: string; error?: string }> {
  try {
    switch (action) {
      case 'rewrite':
        const rewriteResult = await rewriteText({ text });
        return { result: rewriteResult.rewrittenText };
      case 'translate':
        const translateResult = await translateText({ text, targetLanguage: 'English' });
        return { result: translateResult.translation };
      case 'review':
        const reviewResult = await reviewText({ text });
        return { result: reviewResult.reviewedText };
      case 'summarize':
        const summarizeResult = await summarizeText({ text });
        return { result: summarizeResult.summary };
      case 'deepen':
        const deepenResult = await deepenText({ text });
        return { result: deepenResult.deepenedText };
      case 'explain':
        const explainResult = await explainText({ text });
        return { result: explainResult.explanation };
      case 'teach':
        const teachResult = await teachHowToUseText({ text });
        return { result: teachResult.instructions };
      case 'generatePrompt':
        const generatePromptResult = await generatePrompt({ text });
        return { result: generatePromptResult.generatedPrompt };
      default:
        // This is a type error, should not happen at runtime
        throw new Error('Invalid AI action');
    }
  } catch (error) {
    console.error(`Error performing AI action '${action}':`, error);
    return { error: `An error occurred while performing the action. This could be due to an invalid or missing Google API key in the server environment configuration, or a network issue.` };
  }
}
