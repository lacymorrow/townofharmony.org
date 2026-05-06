"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useBuilderEntry } from "@/lib/builder-data";
import { settings as staticSettings, toTownSettings, type BuilderSettingsFlat } from "@/data/town/settings";

export const TownContactForm = () => {
	const { data: builderFlat } = useBuilderEntry<BuilderSettingsFlat>(
		"town-settings",
		{},
		{ fallback: undefined },
	);
	const settings = builderFlat ? toTownSettings(builderFlat) : staticSettings;

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	const contactCards = [
		{
			icon: Phone,
			label: "Phone",
			value: settings.contactInfo.phone,
			href: `tel:${settings.contactInfo.phone.replace(/[^0-9+]/g, "")}`,
		},
		{
			icon: Mail,
			label: "Email",
			value: settings.contactInfo.email,
			href: `mailto:${settings.contactInfo.email}`,
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
				<div className="text-center mb-10">
					<h2 className="text-[32px] font-serif font-bold text-sage-dark mb-2">
						Contact Us
					</h2>
					<p className="text-[#635E56] text-base">
						Get in touch with the Town of Harmony
					</p>
				</div>

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

					{/* Contact Form */}
					<div className="bg-warm-white rounded-xl border border-[#DDD7CC] p-6">
						{submitted ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="w-14 h-14 bg-sage/10 rounded-full flex items-center justify-center mb-4">
									<Mail className="h-6 w-6 text-sage" />
								</div>
								<h3 className="text-xl font-serif font-bold text-sage-dark mb-2">
									Message Sent
								</h3>
								<p className="text-[#4A4640] text-sm max-w-xs">
									Thank you for contacting the Town of
									Harmony. We will get back to you as soon as
									possible.
								</p>
								<button
									type="button"
									onClick={() => {
										setSubmitted(false);
										setFormData({
											name: "",
											email: "",
											subject: "",
											message: "",
										});
									}}
									className="mt-4 text-sm font-semibold text-sage hover:text-sage-dark transition-colors"
								>
									Send another message
								</button>
							</div>
						) : (
							<form
								onSubmit={handleSubmit}
								className="space-y-4"
							>
								<div>
									<label
										htmlFor="contact-name"
										className="block text-sm font-semibold text-[#2D2A24] mb-1.5"
									>
										Name
									</label>
									<input
										id="contact-name"
										name="name"
										type="text"
										required
										value={formData.name}
										onChange={handleChange}
										className="w-full rounded-lg border border-[#DDD7CC] bg-white px-4 py-2.5 text-sm text-[#2D2A24] placeholder-[#9E9A92] focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors"
										placeholder="Your full name"
									/>
								</div>

								<div>
									<label
										htmlFor="contact-email"
										className="block text-sm font-semibold text-[#2D2A24] mb-1.5"
									>
										Email
									</label>
									<input
										id="contact-email"
										name="email"
										type="email"
										required
										value={formData.email}
										onChange={handleChange}
										className="w-full rounded-lg border border-[#DDD7CC] bg-white px-4 py-2.5 text-sm text-[#2D2A24] placeholder-[#9E9A92] focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors"
										placeholder="your@email.com"
									/>
								</div>

								<div>
									<label
										htmlFor="contact-subject"
										className="block text-sm font-semibold text-[#2D2A24] mb-1.5"
									>
										Subject
									</label>
									<input
										id="contact-subject"
										name="subject"
										type="text"
										required
										value={formData.subject}
										onChange={handleChange}
										className="w-full rounded-lg border border-[#DDD7CC] bg-white px-4 py-2.5 text-sm text-[#2D2A24] placeholder-[#9E9A92] focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors"
										placeholder="What is this about?"
									/>
								</div>

								<div>
									<label
										htmlFor="contact-message"
										className="block text-sm font-semibold text-[#2D2A24] mb-1.5"
									>
										Message
									</label>
									<textarea
										id="contact-message"
										name="message"
										required
										rows={5}
										value={formData.message}
										onChange={handleChange}
										className="w-full rounded-lg border border-[#DDD7CC] bg-white px-4 py-2.5 text-sm text-[#2D2A24] placeholder-[#9E9A92] focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors resize-none"
										placeholder="Your message..."
									/>
								</div>

								<button
									type="submit"
									className="w-full bg-sage-dark text-white px-6 py-3 rounded-lg text-[15px] font-semibold hover:bg-sage-deep transition-colors"
								>
									Send Message
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
