// src/ai/flows/adapt-recipe.ts
'use server';

/**
 * @fileOverview Adapts a recipe based on user preferences such as dietary restrictions or serving size.
 *
 * - adaptRecipe - A function that adapts a recipe based on user preferences.
 * - AdaptRecipeInput - The input type for the adaptRecipe function.
 * - AdaptRecipeOutput - The return type for the adaptRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AdaptRecipeInputSchema = z.object({
  recipe: z.string().describe('The recipe to adapt.'),
  preferences: z.string().describe('User preferences for adapting the recipe (e.g., dietary restrictions, serving size).'),
});
export type AdaptRecipeInput = z.infer<typeof AdaptRecipeInputSchema>;

const AdaptRecipeOutputSchema = z.object({
  adaptedRecipe: z.string().describe('The adapted recipe based on user preferences.'),
});
export type AdaptRecipeOutput = z.infer<typeof AdaptRecipeOutputSchema>;

export async function adaptRecipe(input: AdaptRecipeInput): Promise<AdaptRecipeOutput> {
  return adaptRecipeFlow(input);
}

const adaptRecipePrompt = ai.definePrompt({
  name: 'adaptRecipePrompt',
  input: {
    schema: z.object({
      recipe: z.string().describe('The recipe to adapt.'),
      preferences: z.string().describe('User preferences for adapting the recipe (e.g., dietary restrictions, serving size).'),
    }),
  },
  output: {
    schema: z.object({
      adaptedRecipe: z.string().describe('The adapted recipe based on user preferences.'),
    }),
  },
  prompt: `You are a recipe adaptation expert. Please adapt the provided recipe based on the user's preferences.

Recipe: {{{recipe}}}

User Preferences: {{{preferences}}}

Adapted Recipe:`,
});

const adaptRecipeFlow = ai.defineFlow<
  typeof AdaptRecipeInputSchema,
  typeof AdaptRecipeOutputSchema
>(
  {
    name: 'adaptRecipeFlow',
    inputSchema: AdaptRecipeInputSchema,
    outputSchema: AdaptRecipeOutputSchema,
  },
  async input => {
    const {output} = await adaptRecipePrompt(input);
    return output!;
  }
);
