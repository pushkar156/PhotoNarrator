'use server';

/**
 * @fileOverview A flow that generates a descriptive paragraph about a photo using AI.
 *
 * - generatePhotoDescription - A function that handles the photo description generation process.
 * - GeneratePhotoDescriptionInput - The input type for the generatePhotoDescription function.
 * - GeneratePhotoDescriptionOutput - The return type for the generatePhotoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePhotoDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to generate a description for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'      
    ),
});
export type GeneratePhotoDescriptionInput = z.infer<typeof GeneratePhotoDescriptionInputSchema>;

const GeneratePhotoDescriptionOutputSchema = z.object({
  description: z.string().describe('A descriptive paragraph about the photo.'),
});
export type GeneratePhotoDescriptionOutput = z.infer<typeof GeneratePhotoDescriptionOutputSchema>;

export async function generatePhotoDescription(input: GeneratePhotoDescriptionInput): Promise<GeneratePhotoDescriptionOutput> {
  return generatePhotoDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePhotoDescriptionPrompt',
  input: {schema: GeneratePhotoDescriptionInputSchema},
  output: {schema: GeneratePhotoDescriptionOutputSchema},
  prompt: `You are an AI that generates descriptive paragraphs about photos.

  Based on the photo provided, write a detailed and captivating paragraph that describes the scene, objects, and overall mood.

  Photo: {{media url=photoDataUri}}
  `
});

const generatePhotoDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePhotoDescriptionFlow',
    inputSchema: GeneratePhotoDescriptionInputSchema,
    outputSchema: GeneratePhotoDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
