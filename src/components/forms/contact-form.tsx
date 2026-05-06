"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { submitContactForm } from "@/server/actions/contact";
import { type ContactFormData, contactFormSchema } from "@/types/contact";

interface ContactFormProps {
  /** Optional default values for the form */
  defaultValues?: Partial<ContactFormData>;
  /** Optional callback when form is submitted successfully */
  onSuccess?: (data: ContactFormData) => void;
  /** Custom class name for the form container */
  className?: string;
}

export function ContactForm({ defaultValues, onSuccess, className }: ContactFormProps) {
  const { toast } = useToast();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      contactInfo: "",
      message: "",
      newsletter: false,
      ...defaultValues,
    },
  });

  async function onSubmit(data: ContactFormData) {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value?.toString() ?? "");
      }

      const result = await submitContactForm(formData);

      if (result.success) {
        setStatusMessage("Your message has been sent. We'll get back to you as soon as possible.");
        toast({
          title: "Message sent!",
          description: "We'll get back to you as soon as possible.",
        });
        form.reset();
        onSuccess?.(data);
      } else {
        const errorText = result.error || "Something went wrong. Please try again.";
        setStatusMessage(`Error: ${errorText}`);
        toast({
          title: "Error",
          description: errorText,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorText = "Something went wrong. Please try again.";
      setStatusMessage(`Error: ${errorText}`);
      toast({
        title: "Error",
        description: errorText,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      {/* Screen-reader live region for submission result */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        aria-busy={form.formState.isSubmitting}
        noValidate
      >
        <p className="text-xs text-muted-foreground mb-4">
          Fields marked with{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>{" "}
          are required.
        </p>

        <div
          className={cn(
            "grid gap-6",
            form.formState.isSubmitting && "opacity-60 pointer-events-none"
          )}
        >
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name{" "}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    required
                    aria-required="true"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Info Field */}
          <FormField
            control={form.control}
            name="contactInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contact Info{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (email or phone number, optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com or phone number"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Message{" "}
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us how we can help..."
                    className="min-h-[150px]"
                    required
                    aria-required="true"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Newsletter Opt-in */}
          <FormField
            control={form.control}
            name="newsletter"
            render={({ field }) => (
              <FormItem>
                <fieldset className="border-0 p-0 m-0">
                  <legend className="sr-only">Newsletter preferences</legend>
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Stay Updated</FormLabel>
                      <FormDescription>
                        Receive occasional updates about new features and announcements.
                      </FormDescription>
                    </div>
                  </div>
                </fieldset>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-8 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </Form>
  );
}
