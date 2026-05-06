"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Turnstile } from "@/components/turnstile";
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
	defaultValues?: Partial<ContactFormData>;
	onSuccess?: (data: ContactFormData) => void;
	className?: string;
}

export function ContactForm({ defaultValues, onSuccess, className }: ContactFormProps) {
	const { toast } = useToast();
	const turnstileTokenRef = useRef<string | null>(null);
	const [turnstileError, setTurnstileError] = useState(false);
	const loadedAtRef = useRef(Date.now().toString());

	const form = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			name: "",
			contactInfo: "",
			message: "",
			newsletter: false,
			website: "",
			...defaultValues,
		},
	});

	async function onSubmit(data: ContactFormData) {
		try {
			const formData = new FormData();
			for (const [key, value] of Object.entries(data)) {
				formData.append(key, value?.toString() ?? "");
			}
			formData.append("_loadedAt", loadedAtRef.current);
			if (turnstileTokenRef.current) {
				formData.append("turnstileToken", turnstileTokenRef.current);
			}

			const result = await submitContactForm(formData);

			if (result.success) {
				toast({
					title: "Message sent!",
					description: "We'll get back to you as soon as possible.",
				});
				form.reset();
				onSuccess?.(data);
			} else {
				toast({
					title: "Error",
					description: result.error || "Something went wrong. Please try again.",
					variant: "destructive",
				});
			}
		} catch {
			toast({
				title: "Error",
				description: "Something went wrong. Please try again.",
				variant: "destructive",
			});
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={className}>
				<div
					className={cn(
						"grid gap-6",
						form.formState.isSubmitting && "pointer-events-none opacity-60",
					)}
				>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Your name"
										{...field}
										disabled={form.formState.isSubmitting}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="contactInfo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Contact Info{" "}
									<span className="text-xs text-muted-foreground">
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

					<FormField
						control={form.control}
						name="message"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Message</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Tell us how we can help..."
										className="min-h-[150px]"
										{...field}
										disabled={form.formState.isSubmitting}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="newsletter"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
							</FormItem>
						)}
					/>
				</div>

				{/* honeypot — hidden from real users, filled only by bots */}
				<div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
					<label htmlFor="website">Website</label>
					<input
						id="website"
						type="text"
						autoComplete="off"
						tabIndex={-1}
						{...form.register("website")}
					/>
				</div>

				<Turnstile
					onVerify={(token) => {
						turnstileTokenRef.current = token;
						setTurnstileError(false);
					}}
					onError={() => setTurnstileError(true)}
					onExpire={() => {
						turnstileTokenRef.current = null;
					}}
					className="mt-6"
				/>
				{turnstileError && (
					<p className="mt-2 text-sm text-destructive">
						Security check failed. Please refresh and try again.
					</p>
				)}

				<Button type="submit" className="mt-8 w-full" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Sending...
						</>
					) : (
						"Send Message"
					)}
				</Button>
			</form>
		</Form>
	);
}
