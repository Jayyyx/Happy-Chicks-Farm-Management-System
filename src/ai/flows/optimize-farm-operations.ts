'use server';

/**
 * @fileOverview An AI agent that provides suggestions for optimizing farm operations based on recorded data trends.
 *
 * - optimizeFarmOperations - A function that generates optimization suggestions.
 * - OptimizeFarmOperationsInput - The input type for the optimizeFarmOperations function.
 * - OptimizeFarmOperationsOutput - The return type for the optimizeFarmOperations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeFarmOperationsInputSchema = z.object({
  eggProductionRate: z
    .number()
    .describe('The current egg production rate as a percentage.'),
  feedConsumption: z.number().describe('The amount of feed consumed per day in kg.'),
  mortalityRate: z.number().describe('The current mortality rate as a percentage.'),
  numberOfBirds: z.number().describe('The current number of birds in the farm.'),
});
export type OptimizeFarmOperationsInput = z.infer<typeof OptimizeFarmOperationsInputSchema>;

const OptimizeFarmOperationsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-driven suggestions for optimizing farm operations, such as adjusting feed amounts to improve egg production.'
    ),
});
export type OptimizeFarmOperationsOutput = z.infer<typeof OptimizeFarmOperationsOutputSchema>;

export async function optimizeFarmOperations(
  input: OptimizeFarmOperationsInput
): Promise<OptimizeFarmOperationsOutput> {
  return optimizeFarmOperationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeFarmOperationsPrompt',
  input: {schema: OptimizeFarmOperationsInputSchema},
  output: {schema: OptimizeFarmOperationsOutputSchema},
  prompt: `You are an expert in poultry farm management. Based on the current farm data, provide actionable suggestions to optimize operations.

Current Farm Data:
- Egg Production Rate: {{{eggProductionRate}}}%
- Feed Consumption: {{{feedConsumption}}} kg/day
- Mortality Rate: {{{mortalityRate}}}%
- Number of Birds: {{{numberOfBirds}}}

Provide specific suggestions for optimizing feed amounts, improving egg production, and reducing mortality rates. Consider factors like bird age, breed, and environmental conditions.
`,
});

const optimizeFarmOperationsFlow = ai.defineFlow(
  {
    name: 'optimizeFarmOperationsFlow',
    inputSchema: OptimizeFarmOperationsInputSchema,
    outputSchema: OptimizeFarmOperationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
