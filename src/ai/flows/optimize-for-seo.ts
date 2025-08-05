'use server';

/**
 * @fileOverview An AI agent for optimizing content for SEO.
 *
 * - optimizeContentForSeo - A function that handles the content optimization process.
 * - OptimizeContentForSeoInput - The input type for the optimizeContentForSeo function.
 * - OptimizeContentForSeoOutput - The return type for the optimizeContentForSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeContentForSeoInputSchema = z.object({
  content: z.string().describe('The content to be optimized for SEO.'),
  targetKeyword: z.string().optional().describe('Optional target keyword for SEO optimization.'),
});
export type OptimizeContentForSeoInput = z.infer<typeof OptimizeContentForSeoInputSchema>;

const OptimizeContentForSeoOutputSchema = z.object({
  keywords: z.array(z.string()).describe('Suggested keywords for SEO optimization.'),
  metadata: z.object({
    title: z.string().describe('Suggested title metadata for SEO optimization.'),
    description: z.string().describe('Suggested description metadata for SEO optimization.'),
  }).describe('Suggested metadata for SEO optimization.'),
});
export type OptimizeContentForSeoOutput = z.infer<typeof OptimizeContentForSeoOutputSchema>;

export async function optimizeContentForSeo(input: OptimizeContentForSeoInput): Promise<OptimizeContentForSeoOutput> {
  return optimizeContentForSeoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeContentForSeoPrompt',
  input: {schema: OptimizeContentForSeoInputSchema},
  output: {schema: OptimizeContentForSeoOutputSchema},
  prompt: `You are an SEO expert. Analyze the following content and suggest relevant keywords and metadata to improve its search engine ranking.

Content: {{{content}}}

{% if targetKeyword %}Target Keyword: {{{targetKeyword}}}{% endif %}

Provide keywords that are highly relevant and have good search volume. The title should be concise, engaging, and include primary keywords. The description should accurately summarize the content and entice users to click through from search engine results.

Keywords: 
Metadata Title:
Metadata Description:`,
});

const optimizeContentForSeoFlow = ai.defineFlow(
  {
    name: 'optimizeContentForSeoFlow',
    inputSchema: OptimizeContentForSeoInputSchema,
    outputSchema: OptimizeContentForSeoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
