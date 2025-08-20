// Regenerates the description of a given photo.
'use server';
/**
 * @fileOverview An AI agent that regenerates the description of a photo.
 *
 * - regeneratePhotoDescription - A function that handles the regeneration of photo descriptions.
 * - RegeneratePhotoDescriptionInput - The input type for the regeneratePhotoDescription function.
 * - RegeneratePhotoDescriptionOutput - The return type for the regeneratePhotoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegeneratePhotoDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to be described, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type RegeneratePhotoDescriptionInput = z.infer<
  typeof RegeneratePhotoDescriptionInputSchema
>;

const RegeneratePhotoDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A detailed, descriptive paragraph of the photo.'),
});
export type RegeneratePhotoDescriptionOutput = z.infer<
  typeof RegeneratePhotoDescriptionOutputSchema
>;

export async function regeneratePhotoDescription(
  input: RegeneratePhotoDescriptionInput
): Promise<RegeneratePhotoDescriptionOutput> {
  return regeneratePhotoDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regeneratePhotoDescriptionPrompt',
  input: {schema: RegeneratePhotoDescriptionInputSchema},
  output: {schema: RegeneratePhotoDescriptionOutputSchema},
  prompt: `You are an AI expert in describing photos.

  Based on the photo, generate a detailed and descriptive paragraph about it.

  Photo: {{media url=photoDataUri}}`,
});

const regeneratePhotoDescriptionFlow = ai.defineFlow(
  {
    name: 'regeneratePhotoDescriptionFlow',
    inputSchema: RegeneratePhotoDescriptionInputSchema,
    outputSchema: RegeneratePhotoDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
