'use server';

/**
 * @fileOverview AI-powered event suggestion generator for the school calendar.
 *
 * - generateEventSuggestions - A function to generate event suggestions.
 * - GenerateEventSuggestionsInput - The input type for the generateEventSuggestions function.
 * - GenerateEventSuggestionsOutput - The return type for the generateEventSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventSuggestionsInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical school event data including descriptions and attendance.'),
  studentFeedback: z
    .string()
    .describe('Summarized student feedback on previous events.'),
  upcomingHolidays: z
    .string()
    .describe('A list of upcoming holidays and school breaks.'),
  preferences: z
    .string()
    .optional()
    .describe('Additional preferences or themes to consider.')
});

export type GenerateEventSuggestionsInput = z.infer<
  typeof GenerateEventSuggestionsInputSchema
>;

const GenerateEventSuggestionsOutputSchema = z.object({
  eventSuggestions: z
    .string()
    .describe('A list of suggested event ideas with brief descriptions.'),
});

export type GenerateEventSuggestionsOutput = z.infer<
  typeof GenerateEventSuggestionsOutputSchema
>;

export async function generateEventSuggestions(
  input: GenerateEventSuggestionsInput
): Promise<GenerateEventSuggestionsOutput> {
  return generateEventSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEventSuggestionsPrompt',
  input: {
    schema: GenerateEventSuggestionsInputSchema,
  },
  output: {
    schema: GenerateEventSuggestionsOutputSchema,
  },
  prompt: `You are an AI assistant specialized in generating creative and engaging event suggestions for a school calendar.

  Consider the following information to formulate your suggestions:

  Historical Event Data: {{{historicalData}}}
  Student Feedback: {{{studentFeedback}}}
  Upcoming Holidays: {{{upcomingHolidays}}}

  Preferences: {{{preferences}}}

  Based on this information, suggest a diverse range of event ideas that would appeal to students and align with the school's values. Provide a brief description for each event. Focus on events that are fun, educational, and foster a sense of community.
  Format your response as a list of event suggestions with a short description for each.`,  
});

const generateEventSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateEventSuggestionsFlow',
    inputSchema: GenerateEventSuggestionsInputSchema,
    outputSchema: GenerateEventSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
