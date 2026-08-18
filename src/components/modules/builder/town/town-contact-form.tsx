"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { useBuilderEntry } from "@/lib/builder-data";
import { TownContactForm as ContactFormImpl } from "@/components/modules/town/town-contact-form";
import { settings as staticSettings, toTownSettings, type BuilderSettingsFlat } from "@/data/town/settings";

interface TownContactFormProps {
	recipientEmail?: string;
	bccEmail?: string;
}

export const TownContactForm = ({ recipientEmail, bccEmail }: TownContactFormProps = {}) => {
	const { data: builderFlat } = useBuilderEntry<BuilderSettingsFlat>(
		"town-settings",
		{},
		{ fallback: undefined },
	);
	const settings = builderFlat ? toTownSettings(builderFlat) : staticSettings;

	const contactCards = [
		{
			icon: Phone,
			label: "Phone",
			value: settings.contactInfo.phone,
			href: `tel:${settings.contactInfo.phone.replace(/[^0-9+]/g, "")}`,
		},
		{
			icon: MapPin,
			label: "Address",
			value: settings.contactInfo.address,
			href: `https://maps.google.com/?q=${encodeURIComponent(settings.contactInfo.address)}`,
		},
		{
			icon: Clock,
			label: "Office Hours",
			value: `${settings.officeHours.weekday}\n${settings.officeHours.weekend}`,
			href: null,
		},
	];

	return (
		<section className="py-16 bg-warm-white">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Contact Info Cards */}
					<div className="space-y-4">
						{contactCards.map((card) => {
							const Icon = card.icon;
							const content = (
								<div className="flex items-start gap-4 bg-warm-white rounded-xl border border-[#DDD7CC] p-5 hover:shadow-md transition-shadow">
									<div className="w-11 h-11 bg-sage-dark rounded-lg flex items-center justify-center flex-shrink-0">
										<Icon className="h-5 w-5 text-wheat" />
									</div>
									<div>
										<p className="text-sm font-semibold text-[#4A4640] uppercase tracking-wider mb-1">
											{card.label}
										</p>
										<p className="text-[15px] text-[#2D2A24] font-medium whitespace-pre-line">
											{card.value}
										</p>
									</div>
								</div>
							);

							if (card.href) {
								return (
									<a
										key={card.label}
										href={card.href}
										target={
											card.label === "Address"
												? "_blank"
												: undefined
										}
										rel={
											card.label === "Address"
												? "noopener noreferrer"
												: undefined
										}
										className="block cursor-pointer"
									>
										{content}
									</a>
								);
							}
							return (
								<div key={card.label}>{content}</div>
							);
						})}
					</div>

					{/* Contact Form — uses the full-featured static form with
					    server action, validation, honeypot, and Turnstile.
					    recipient/bcc overrides let town staff re-route inquiries
					    from Builder without a code deploy (LAC-3347). */}
					<ContactFormImpl recipientEmail={recipientEmail} bccEmail={bccEmail} />
				</div>
			</div>
		</section>
	);
};
