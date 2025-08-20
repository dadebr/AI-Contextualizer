"use server";

import { rewriteText } from '@/ai/flows/rewrite-text';
import { translateText } from '@/ai/flows/translate-text';
import { reviewText } from '@/ai/flows/review-text';
import { summarizeText } from '@/ai/flows/summarize-text';

export type AiAction = 'rewrite' | 'translate' | 'review' | 'summarize';

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
        const lang = targetLanguage === 'en-US' || targetLanguage === 'en' ? 'English' : 'Português (Brasil)';
        const translateResult = await translateText({ text, targetLanguage: lang });
        return { result: translateResult.translation };
      case 'review':
        const reviewResult = await reviewText({ text });
        return { result: reviewResult.reviewedText };
      case 'summarize':
        const summarizeResult = await summarizeText({ text });
        return { result: summarizeResult.summary };
      default:
        // This is a type error, should not happen at runtime
        throw new Error('Invalid AI action');
    }
  } catch (error) {
    console.error(`Error performing AI action '${action}':`, error);
    return { error: `An error occurred while performing the action. This could be due to an invalid or missing Google API key in the server environment configuration, or a network issue.` };
  }
}
