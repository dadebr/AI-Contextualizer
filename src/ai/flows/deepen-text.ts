'use server';
/**
 * @fileOverview Deepen text AI agent.
 *
 * - deepenText - A function that handles the text deepening process.
 * - DeepenTextInput - The input type for the deepenText function.
 * - DeepenTextOutput - The return type for the deepenText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepenTextInputSchema = z.object({
  text: z.string().describe('The text to deepen.'),
});
export type DeepenTextInput = z.infer<typeof DeepenTextInputSchema>;

const DeepenTextOutputSchema = z.object({
  deepenedText: z.string().describe('The deepened text with more information.'),
});
export type DeepenTextOutput = z.infer<typeof DeepenTextOutputSchema>;

export async function deepenText(input: DeepenTextInput): Promise<DeepenTextOutput> {
  return deepenTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepenTextPrompt',
  input: {schema: DeepenTextInputSchema},
  output: {schema: DeepenTextOutputSchema},
  prompt: `Você é um assistente de IA. Sua tarefa é pesquisar sobre o assunto do texto a seguir e retornar o resultado com mais detalhes e informações:\n\n{{{text}}}`,
});

const deepenTextFlow = ai.defineFlow(
  {
    name: 'deepenTextFlow',
    inputSchema: DeepenTextInputSchema,
    outputSchema: DeepenTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
