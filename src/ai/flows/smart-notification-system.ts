'use server';

/**
 * @fileOverview Implements a smart notification system that analyzes school events, notices, and user roles to deliver relevant notifications.
 *
 * - smartNotification - A function that generates a personalized notification based on school data and user role.
 * - SmartNotificationInput - The input type for the smartNotification function.
 * - SmartNotificationOutput - The return type for the smartNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartNotificationInputSchema = z.object({
  userRole: z
    .enum(['student', 'teacher', 'parent'])
    .describe('The role of the user.'),
  events: z.array(z.string()).describe('A list of school events.'),
  notices: z.array(z.string()).describe('A list of school notices.'),
  studentDetails: z.string().optional().describe('Student-specific details, if applicable.'),
  teacherDetails: z.string().optional().describe('Teacher-specific details, if applicable.'),
  parentDetails: z.string().optional().describe('Parent-specific details, if applicable.'),
});
export type SmartNotificationInput = z.infer<typeof SmartNotificationInputSchema>;

const SmartNotificationOutputSchema = z.object({
  notificationTitle: z.string().describe('The title of the notification.'),
  notificationBody: z.string().describe('The body of the notification.'),
  relevanceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A score indicating the relevance of the notification to the user.'),
});
export type SmartNotificationOutput = z.infer<typeof SmartNotificationOutputSchema>;

export async function smartNotification(input: SmartNotificationInput): Promise<SmartNotificationOutput> {
  return smartNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartNotificationPrompt',
  input: {schema: SmartNotificationInputSchema},
  output: {schema: SmartNotificationOutputSchema},
  prompt: `You are an AI assistant designed to generate smart notifications for a school.

You will receive information about the user's role (student, teacher, or parent), a list of school events, and a list of school notices.

Based on this information, you will generate a personalized notification that is relevant to the user.

The notification should have a title and a body.

You should also provide a relevance score, indicating how relevant the notification is to the user. The relevance score should be a number between 0 and 1.

Here is the user's role: {{{userRole}}}

Here are the school events: {{{events}}}

Here are the school notices: {{{notices}}}

{{#if studentDetails}}
Here are the student details: {{{studentDetails}}}
{{/if}}

{{#if teacherDetails}}
Here are the teacher details: {{{teacherDetails}}}
{{/if}}

{{#if parentDetails}}
Here are the parent details: {{{parentDetails}}}
{{/if}}`,
});

const smartNotificationFlow = ai.defineFlow(
  {
    name: 'smartNotificationFlow',
    inputSchema: SmartNotificationInputSchema,
    outputSchema: SmartNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
