'use server';
/**
 * @fileOverview Generate prompt AI agent.
 *
 * - generatePrompt - A function that handles the prompt generation process.
 * - GeneratePromptInput - The input type for the generatePrompt function.
 * - GeneratePromptOutput - The return type for the generatePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromptInputSchema = z.object({
  text: z.string().describe('The context to generate a prompt from.'),
});
export type GeneratePromptInput = z.infer<typeof GeneratePromptInputSchema>;

const GeneratePromptOutputSchema = z.object({
  generatedPrompt: z.string().describe('The generated prompt.'),
});
export type GeneratePromptOutput = z.infer<typeof GeneratePromptOutputSchema>;

export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  return generatePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromptPrompt',
  input: {schema: GeneratePromptInputSchema},
  output: {schema: GeneratePromptOutputSchema},
  prompt: `Você é um especialista em engenharia de prompts de IA. Com base no contexto fornecido, gere um prompt completo e bem estruturado. O prompt deve incluir:
- **Persona:** Quem a IA deve ser.
- **Contexto:** Informações relevantes que a IA precisa saber.
- **Objetivo:** A tarefa específica que a IA deve realizar.
- **Formato de Saída:** Como a resposta deve ser estruturada.
- **Exemplos:** Pelo menos um exemplo de entrada e saída esperada.

Contexto fornecido:
{{{text}}}`,
});

const generatePromptFlow = ai.defineFlow(
  {
    name: 'generatePromptFlow',
    inputSchema: GeneratePromptInputSchema,
    outputSchema: GeneratePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
