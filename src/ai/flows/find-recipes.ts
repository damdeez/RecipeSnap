// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview Finds recipes based on a list of ingredients using AI.
 *
 * - findRecipes - A function that takes a list of ingredients and returns a list of recipe options.
 * - FindRecipesInput - The input type for the findRecipes function.
 * - FindRecipesOutput - The return type for the findRecipes function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const FindRecipesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to find recipes for.'),
});
export type FindRecipesInput = z.infer<typeof FindRecipesInputSchema>;

const FindRecipesOutputSchema = z.object({
  recipes: z.array(z.string()).describe('A list of recipe options.'),
});
export type FindRecipesOutput = z.infer<typeof FindRecipesOutputSchema>;

export async function findRecipes(input: FindRecipesInput): Promise<FindRecipesOutput> {
  return findRecipesFlow(input);
}

const findRecipesPrompt = ai.definePrompt({
  name: 'findRecipesPrompt',
  input: {
    schema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients to find recipes for.'),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(z.string()).describe('A list of recipe options.'),
    }),
  },
  prompt: `You are a recipe finding assistant. Given a list of ingredients, you will find recipes that can be made with those ingredients.

Ingredients:
{{#each ingredients}}- {{{this}}}
{{/each}}

Recipes:`,
});

const findRecipesFlow = ai.defineFlow<
  typeof FindRecipesInputSchema,
  typeof FindRecipesOutputSchema
>({
  name: 'findRecipesFlow',
  inputSchema: FindRecipesInputSchema,
  outputSchema: FindRecipesOutputSchema,
},
  async input => {
    const { output } = await findRecipesPrompt(input);
    return output!;
  });
