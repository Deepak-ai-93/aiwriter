// This is a server-side file.
'use server';

/**
 * @fileOverview Generates multiple variations of ad copy from a single input to test different marketing angles.
 *
 * - generateAdCopyVariations - A function that generates ad copy variations.
 * - GenerateAdCopyVariationsInput - The input type for the generateAdCopyVariations function.
 * - GenerateAdCopyVariationsOutput - The return type for the generateAdCopyVariations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdCopyVariationsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
  targetAudience: z.string().describe('The target audience for the ad copy.'),
  numberOfVariations: z.number().describe('The number of ad copy variations to generate.'),
});
export type GenerateAdCopyVariationsInput = z.infer<typeof GenerateAdCopyVariationsInputSchema>;

const GenerateAdCopyVariationsOutputSchema = z.object({
  adCopyVariations: z.array(z.string()).describe('An array of ad copy variations.'),
});
export type GenerateAdCopyVariationsOutput = z.infer<typeof GenerateAdCopyVariationsOutputSchema>;

export async function generateAdCopyVariations(input: GenerateAdCopyVariationsInput): Promise<GenerateAdCopyVariationsOutput> {
  return generateAdCopyVariationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyVariationsPrompt',
  input: {schema: GenerateAdCopyVariationsInputSchema},
  output: {schema: GenerateAdCopyVariationsOutputSchema},
  prompt: `You are an expert copywriter specializing in creating engaging ad copy.

You will generate {{numberOfVariations}} ad copy variations for the following product, tailored to the specified target audience.

Product Name: {{productName}}
Product Description: {{productDescription}}
Target Audience: {{targetAudience}}

Each ad copy variation should be unique and highlight different aspects of the product to appeal to the target audience. Focus on brevity, compelling language, and a clear call to action.

Your output should be a JSON array of strings, where each string is an ad copy variation.

Here's an example of how to properly format the response:

{ "adCopyVariations": ["Ad copy variation 1", "Ad copy variation 2", "Ad copy variation 3"] }
`,
});

const generateAdCopyVariationsFlow = ai.defineFlow(
  {
    name: 'generateAdCopyVariationsFlow',
    inputSchema: GenerateAdCopyVariationsInputSchema,
    outputSchema: GenerateAdCopyVariationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
