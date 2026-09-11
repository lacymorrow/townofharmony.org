import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { emergencyServices } from "@/data/town/emergency-services";
import { settings } from "@/data/town/settings";

export const EmergencyContacts = () => {
	return (
		<div className="space-y-6">
			<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
				<h2 className="text-xl font-serif font-bold text-barn-red mb-1">
					Life-Threatening Emergency: Call{" "}
					<span className="inline-flex items-center gap-2">
						<a href="tel:911" className="text-2xl hover:underline">911</a>
						<PhoneCopyButton phone="911" label="911" tone="onLight" />
					</span>
				</h2>
				<p className="text-[#4A4640]">
					For immediate emergency assistance requiring police, fire, or medical response, always
					dial 911 first.
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{emergencyServices.map((service) => (
					<Card key={service.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg text-sage-dark">{service.title}</CardTitle>
						</CardHeader>

						<CardContent className="space-y-3">
							<div className="flex items-center gap-2 text-[#4A4640]">
								<Phone className="h-4 w-4 text-sage flex-shrink-0" />
								<a
									href={`tel:${service.phone.replace(/[^\d+]/g, "")}`}
									className={`font-bold hover:underline ${service.phone === "911" ? "text-barn-red text-xl" : "text-sage text-lg hover:text-sage-dark"}`}
								>
									{service.phone}
								</a>
								<PhoneCopyButton phone={service.phone} label={service.title} />
							</div>

							{service.description && (
								<p className="text-base text-[#4A4640] pt-2 border-t border-[#DDD7CC]">{service.description}</p>
							)}

							{service.preparedness.length > 0 && (
								<div className="pt-2">
									<p className="text-sm font-medium text-[#2D2A24] mb-1">Be Prepared:</p>
									<ul className="text-sm text-[#635E56] space-y-0.5 list-disc list-inside">
										{service.preparedness.slice(0, 3).map((tip) => (
											<li key={tip}>{tip}</li>
										))}
									</ul>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="bg-sage/5 border-sage/20">
				<CardContent className="p-6">
					<h3 className="font-semibold text-sage-dark mb-3 font-serif">Additional Resources</h3>
					<div className="space-y-2 text-base text-[#4A4640]">
						<p>
							<strong className="text-[#2D2A24]">North Carolina Highway Patrol:</strong>{" "}
							<span className="inline-flex items-center gap-2">
								<a href="tel:1-800-662-7956" className="text-sage hover:text-sage-dark underline">
									1-800-662-7956
								</a>
								<PhoneCopyButton phone="1-800-662-7956" label="North Carolina Highway Patrol" />
							</span>
						</p>
						<p>
							<strong className="text-[#2D2A24]">{settings.branding.county} Emergency Services:</strong>{" "}
							<span className="inline-flex items-center gap-2">
								<a href="tel:704-878-3000" className="text-sage hover:text-sage-dark underline">
									(704) 878-3000
								</a>
								<PhoneCopyButton phone="(704) 878-3000" label={`${settings.branding.county} Emergency Services`} />
							</span>
						</p>
						<p>
							<strong className="text-[#2D2A24]">Red Cross Disaster Relief:</strong>{" "}
							<span className="inline-flex items-center gap-2">
								<a href="tel:1-800-733-2767" className="text-sage hover:text-sage-dark underline">
									1-800-RED-CROSS
								</a>
								<PhoneCopyButton phone="1-800-733-2767" label="Red Cross Disaster Relief" />
							</span>
						</p>
						<p>
							<strong className="text-[#2D2A24]">Crisis Text Line:</strong> Text HOME to{" "}
							<span className="inline-flex items-center gap-2">
								<a href="sms:741741" className="text-sage hover:text-sage-dark underline">
									741741
								</a>
								<PhoneCopyButton phone="741741" label="Crisis Text Line" />
							</span>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
