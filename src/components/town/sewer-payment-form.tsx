"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SEWER_ACCOUNT_REGEX, sewerContactInfo, type SewerRateDisplay } from "@/data/town/sewer-rates";
import { createSewerCheckoutSession } from "@/server/actions/sewer-payments";

const sewerPaymentFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Valid email is required"),
	address: z.string().min(1, "Service address is required"),
	accountNumber: z
		.string()
		.regex(SEWER_ACCOUNT_REGEX, "Account number is required"),
	tierId: z.string().min(1, "Please select a rate tier"),
	paymentType: z.enum(["one-time", "auto-pay"]),
});

type SewerPaymentFormData = z.infer<typeof sewerPaymentFormSchema>;

interface SewerPaymentFormProps {
	stripeEnabled: boolean;
	rates: SewerRateDisplay[];
}

export const SewerPaymentForm = ({ stripeEnabled, rates }: SewerPaymentFormProps) => {
	const { toast } = useToast();
	const [isRedirecting, setIsRedirecting] = useState(false);

	const form = useForm<SewerPaymentFormData>({
		resolver: zodResolver(sewerPaymentFormSchema),
		defaultValues: {
			name: "",
			email: "",
			address: "",
			accountNumber: "",
			tierId: "",
			paymentType: "one-time",
		},
	});

	const selectedTierId = form.watch("tierId");
	const selectedTier = rates.find((t) => t.id === selectedTierId);
	const paymentType = form.watch("paymentType");

	const onSubmit = async (data: SewerPaymentFormData) => {
		setIsRedirecting(false);

		const formData = new FormData();
		for (const [key, value] of Object.entries(data)) {
			formData.append(key, value);
		}

		try {
			const result = await createSewerCheckoutSession(formData);

			if (result.success) {
				setIsRedirecting(true);
				window.location.href = result.url;
			} else {
				toast({
					title: "Payment Error",
					description: result.error,
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
	};

	if (!stripeEnabled) {
		return (
			<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-900 dark:bg-yellow-950">
				<h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
					Online Payments Unavailable
				</h3>
				<p className="text-base text-yellow-700 dark:text-yellow-300">
					Online sewer bill payments are not currently available. Please visit Town Hall or
					contact the {sewerContactInfo.department} at {sewerContactInfo.phone} to pay your bill.
				</p>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className={form.formState.isSubmitting || isRedirecting ? "pointer-events-none opacity-60" : ""}>
					<div className="grid gap-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder="John Smith" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input type="email" placeholder="john@example.com" {...field} />
									</FormControl>
									<FormDescription>Receipt will be sent to this email</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Service Address</FormLabel>
									<FormControl>
										<Input placeholder="123 Main St, Harmony, NC" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="accountNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sewer Account Number</FormLabel>
									<FormControl>
										<Input placeholder="As shown on your sewer bill" {...field} />
									</FormControl>
									<FormDescription>
										Enter the account number shown on your most recent sewer
										bill. Contact Town Hall at (704) 546-2339 if you can't
										locate it.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="tierId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rate Tier</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select your rate tier" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{rates.map((tier) => (
												<SelectItem key={tier.id} value={tier.id}>
													{tier.name} - ${tier.monthlyRate.toFixed(2)}/mo
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{selectedTier && (
							<div className="rounded-lg border bg-muted/50 p-4">
								<p className="text-sm text-muted-foreground">{selectedTier.description}</p>
								<p className="mt-1 text-2xl font-bold">
									${selectedTier.monthlyRate.toFixed(2)}
									<span className="text-sm font-normal text-muted-foreground">/month</span>
								</p>
							</div>
						)}

						<FormField
							control={form.control}
							name="paymentType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Payment Type</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											value={field.value}
											className="flex flex-col gap-3 sm:flex-row"
										>
											<label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary">
												<RadioGroupItem value="one-time" />
												<div>
													<p className="text-sm font-medium">One-Time Payment</p>
													<p className="text-sm text-muted-foreground">Pay this month only</p>
												</div>
											</label>
											<label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary">
												<RadioGroupItem value="auto-pay" />
												<div>
													<p className="text-sm font-medium">Auto-Pay (Monthly)</p>
													<p className="text-sm text-muted-foreground">
														Automatic monthly billing
													</p>
												</div>
											</label>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="mt-8 w-full"
					size="lg"
					disabled={form.formState.isSubmitting || isRedirecting}
				>
					{form.formState.isSubmitting || isRedirecting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{isRedirecting ? "Redirecting to payment..." : "Processing..."}
						</>
					) : (
						<>
							{paymentType === "auto-pay" ? "Set Up Auto-Pay" : "Pay Now"}
							{selectedTier && ` - $${selectedTier.monthlyRate.toFixed(2)}`}
						</>
					)}
				</Button>
			</form>
		</Form>
	);
};
