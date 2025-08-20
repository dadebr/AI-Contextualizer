'use server';
/**
 * @fileOverview Review text AI agent.
 *
 * - reviewText - A function that handles the text review process.
 * - ReviewTextInput - The input type for the reviewText function.
 * - ReviewTextOutput - The return type for the reviewText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewTextInputSchema = z.object({
  text: z.string().describe('The text to review for grammar and spelling errors.'),
});
export type ReviewTextInput = z.infer<typeof ReviewTextInputSchema>;

const ReviewTextOutputSchema = z.object({
  reviewedText: z.string().describe('The reviewed text with grammar and spelling corrections.'),
});
export type ReviewTextOutput = z.infer<typeof ReviewTextOutputSchema>;

export async function reviewText(input: ReviewTextInput): Promise<ReviewTextOutput> {
  return reviewTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewTextPrompt',
  input: {schema: ReviewTextInputSchema},
  output: {schema: ReviewTextOutputSchema},
  prompt: `Por favor, revise o seguinte texto em busca de erros gramaticais e ortográficos e forneça uma versão corrigida:\n\n{{{text}}}`,
});

const reviewTextFlow = ai.defineFlow(
  {
    name: 'reviewTextFlow',
    inputSchema: ReviewTextInputSchema,
    outputSchema: ReviewTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
