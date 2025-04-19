'use server';

/**
 * @fileOverview Detects ingredients from a photo using AI.
 *
 * - detectIngredients - A function that handles the ingredient detection process.
 * - DetectIngredientsInput - The input type for the detectIngredients function.
 * - DetectIngredientsOutput - The return type for the detectIngredients function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const DetectIngredientsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the ingredient photo.').optional(),
  photoData: z.string().describe('The base64 encoded data of the ingredient photo.').optional(),
}).refine(data => !!data.photoUrl !== !!data.photoData, {
  message: "Either photoUrl or photoData must be provided, but not both.",
});

export type DetectIngredientsInput = z.infer<typeof DetectIngredientsInputSchema>;

const DetectIngredientsOutputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients identified in the photo.'),
});
export type DetectIngredientsOutput = z.infer<typeof DetectIngredientsOutputSchema>;

export async function detectIngredients(input: DetectIngredientsInput): Promise<DetectIngredientsOutput> {
  return detectIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectIngredientsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the ingredient photo.').optional(),
      photoData: z.string().describe('The base64 encoded data of the ingredient photo.').optional(),
    }),
  },
  output: {
    schema: z.object({
      ingredients: z
        .array(z.string())
        .describe('A list of ingredients identified in the photo.'),
    }),
  },
  prompt: `You are a chef. Please identify the ingredients shown in the following photo:

{{#if photoUrl}}
Photo: {{media url=photoUrl}}
{{else}}
Photo: {{media data=photoData}}
{{/if}}

List the ingredients as a simple list of strings. Do not include any other text.`,
});

const detectIngredientsFlow = ai.defineFlow<
  typeof DetectIngredientsInputSchema,
  typeof DetectIngredientsOutputSchema
>({
  name: 'detectIngredientsFlow',
  inputSchema: DetectIngredientsInputSchema,
  outputSchema: DetectIngredientsOutputSchema,
},
  async input => {
    const { output } = await prompt(input);
    return output!;
  });
