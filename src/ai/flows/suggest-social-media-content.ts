'use server';

/**
 * @fileOverview A social media content generation AI agent.
 *
 * - generateSocialMediaContent - A function that generates social media content and hashtags.
 * - GenerateSocialMediaContentInput - The input type for the generateSocialMediaContent function.
 * - GenerateSocialMediaContentOutput - The return type for the generateSocialMediaContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialMediaContentInputSchema = z.object({
  copy: z.string().describe('The copy to generate social media content from.'),
});
export type GenerateSocialMediaContentInput = z.infer<typeof GenerateSocialMediaContentInputSchema>;

const GenerateSocialMediaContentOutputSchema = z.object({
  content: z.string().describe('The generated social media content.'),
  hashtags: z.array(z.string()).describe('The suggested hashtags.'),
});
export type GenerateSocialMediaContentOutput = z.infer<typeof GenerateSocialMediaContentOutputSchema>;

export async function generateSocialMediaContent(
  input: GenerateSocialMediaContentInput
): Promise<GenerateSocialMediaContentOutput> {
  return generateSocialMediaContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialMediaContentPrompt',
  input: {schema: GenerateSocialMediaContentInputSchema},
  output: {schema: GenerateSocialMediaContentOutputSchema},
  prompt: `You are a social media manager and copywriting expert with 30 years of experience.

  You will generate social media content based on the provided copy, and suggest relevant hashtags to extend reach.

  Copy: {{{copy}}}

  Your output should be formatted as a JSON object.
`,
});

const generateSocialMediaContentFlow = ai.defineFlow(
  {
    name: 'generateSocialMediaContentFlow',
    inputSchema: GenerateSocialMediaContentInputSchema,
    outputSchema: GenerateSocialMediaContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
