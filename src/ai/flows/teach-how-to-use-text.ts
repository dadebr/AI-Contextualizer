'use server';
/**
 * @fileOverview Teach how to use text AI agent.
 *
 * - teachHowToUseText - A function that handles the step-by-step instruction process.
 * - TeachHowToUseTextInput - The input type for the teachHowToUseText function.
 * - TeachHowToUseTextOutput - The return type for the teachHowToUseText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TeachHowToUseTextInputSchema = z.object({
  text: z.string().describe('The context to create a step-by-step guide for.'),
});
export type TeachHowToUseTextInput = z.infer<typeof TeachHowToUseTextInputSchema>;

const TeachHowToUseTextOutputSchema = z.object({
  instructions: z.string().describe('The step-by-step guide.'),
});
export type TeachHowToUseTextOutput = z.infer<typeof TeachHowToUseTextOutputSchema>;

export async function teachHowToUseText(input: TeachHowToUseTextInput): Promise<TeachHowToUseTextOutput> {
  return teachHowToUseTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'teachHowToUseTextPrompt',
  input: {schema: TeachHowToUseTextInputSchema},
  output: {schema: TeachHowToUseTextOutputSchema},
  prompt: `Você é um instrutor de IA. Sua tarefa é criar um guia passo a passo detalhado e fácil de seguir sobre como usar ou executar o seguinte:\n\n{{{text}}}`,
});

const teachHowToUseTextFlow = ai.defineFlow(
  {
    name: 'teachHowToUseTextFlow',
    inputSchema: TeachHowToUseTextInputSchema,
    outputSchema: TeachHowToUseTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
