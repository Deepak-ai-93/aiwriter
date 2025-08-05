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
  targetAudience: z.object({
    ageRange: z.string().describe('The target age range for the ad copy (e.g., 25-35).'),
    gender: z.string().describe('The target gender for the ad copy (e.g., Female, Male, All).'),
    location: z.string().describe('The target location for the ad copy (e.g., Urban areas, California).'),
    interests: z.string().describe('The key interests of the target audience (e.g., "outdoor activities, technology").'),
  }).describe('The detailed target audience for the ad copy.'),
  numberOfVariations: z.number().describe('The number of ad copy variations to generate.'),
});
export type GenerateAdCopyVariationsInput = z.infer<typeof GenerateAdCopyVariationsInputSchema>;

const AdCopyVariationSchema = z.object({
  copy: z.string().describe('The generated ad copy text.'),
  explanation: z.string().describe('An explanation of why this ad copy is engaging and effective for the target audience.'),
});

const GenerateAdCopyVariationsOutputSchema = z.object({
  adCopyVariations: z.array(AdCopyVariationSchema).describe('An array of ad copy variations, each with the copy and an explanation.'),
});
export type GenerateAdCopyVariationsOutput = z.infer<typeof GenerateAdCopyVariationsOutputSchema>;

export async function generateAdCopyVariations(input: GenerateAdCopyVariationsInput): Promise<GenerateAdCopyVariationsOutput> {
  return generateAdCopyVariationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdCopyVariationsPrompt',
  input: {schema: GenerateAdCopyVariationsInputSchema},
  output: {schema: GenerateAdCopyVariationsOutputSchema},
  prompt: `You are a copywriting expert with 30 years of experience, specializing in creating engaging ad copy that converts by using timeless psychological frameworks.

You will generate {{numberOfVariations}} ad copy variations for the following product, tailored to the specified target audience. You must use the AIDA or PAS framework for each variation.

Product Name: {{productName}}
Product Description: {{productDescription}}

Target Audience Details:
- Age Range: {{targetAudience.ageRange}}
- Gender: {{targetAudience.gender}}
- Location: {{targetAudience.location}}
- Interests: {{targetAudience.interests}}

---
Psychological Frameworks to Use:

1.  **AIDA (Attention, Interest, Desire, Action):** This is a funnel for your words.
    *   **Attention:** Start with a headline that grabs them by the collar. Use a bold statement, an intriguing question, or a surprising statistic.
    *   **Interest:** Keep them reading by providing valuable, relevant information. Talk about them and their problem.
    *   **Desire:** Paint a picture of a better future. Focus on the benefits, not just the features.
    *   **Action:** Tell them exactly what to do next with a clear, compelling call-to-action (CTA).

2.  **PAS (Problem, Agitate, Solve):** This one is pure empathy.
    *   **Problem:** State the problem your audience is facing.
    *   **Agitate:** Pour a little salt in the wound. Describe the consequences of this problem to make the pain more real.
    *   **Solve:** Present your solution as the definitive relief to that pain.
---

For each variation, you must provide:
1.  **The Ad Copy**: A unique and compelling piece of copy based on either the AIDA or PAS framework. It should be brief, have a clear call to action, and resonate with the specified audience.
2.  **The Explanation**: A concise analysis of *why* the ad copy is engaging. Explain which framework (AIDA or PAS) was used and how it was applied to appeal to the target audience's specific demographics and interests.

Your output must be a JSON object containing an 'adCopyVariations' array. Each element in the array should be an object with 'copy' and 'explanation' fields.
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
