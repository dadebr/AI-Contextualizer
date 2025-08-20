'use server';
/**
 * @fileOverview Explain text AI agent.
 *
 * - explainText - A function that handles the text explanation process.
 * - ExplainTextInput - The input type for the explainText function.
 * - ExplainTextOutput - The return type for the explainText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTextInputSchema = z.object({
  text: z.string().describe('The text to explain.'),
});
export type ExplainTextInput = z.infer<typeof ExplainTextInputSchema>;

const ExplainTextOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the text.'),
});
export type ExplainTextOutput = z.infer<typeof ExplainTextOutputSchema>;

export async function explainText(input: ExplainTextInput): Promise<ExplainTextOutput> {
  return explainTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTextPrompt',
  input: {schema: ExplainTextInputSchema},
  output: {schema: ExplainTextOutputSchema},
  prompt: `Você é um professor de IA. Sua tarefa é explicar o seguinte texto de forma didática e clara, como se estivesse ensinando a um aluno:\n\n{{{text}}}`,
});

const explainTextFlow = ai.defineFlow(
  {
    name: 'explainTextFlow',
    inputSchema: ExplainTextInputSchema,
    outputSchema: ExplainTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
