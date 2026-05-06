import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters. Please enter your first and last name."),
  contactInfo: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters. Please provide more detail so we can assist you."),
  newsletter: z.boolean(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
