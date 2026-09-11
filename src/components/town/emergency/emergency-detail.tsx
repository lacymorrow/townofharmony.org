import {
	AlertOctagon,
	AlertTriangle,
	Calendar,
	Clock,
	ExternalLink,
	Info,
	MapPin,
	Phone,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PayloadRichText } from "@/components/town/payload-rich-text";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncementById } from "@/lib/town-data";

interface EmergencyDetailProps {
	alertId: number;
}

const getLevelIcon = (level: string) => {
	switch (level) {
		case "critical":
			return AlertOctagon;
		case "warning":
			return AlertTriangle;
		case "info":
		default:
			return Info;
	}
};

const getLevelColors = (level: string) => {
	switch (level) {
		case "critical":
			return {
				bg: "bg-red-50",
				border: "border-red-200",
				text: "text-red-800",
				icon: "text-red-600",
				badge: "bg-red-100 text-red-800",
				headerBg: "bg-barn-red",
			};
		case "warning":
			return {
				bg: "bg-amber-50",
				border: "border-amber-200",
				text: "text-amber-900",
				icon: "text-amber-600",
				badge: "bg-amber-100 text-amber-900",
				headerBg: "bg-amber-600",
			};
		case "info":
		default:
			return {
				bg: "bg-sage/5",
				border: "border-sage/20",
				text: "text-sage-dark",
				icon: "text-sage",
				badge: "bg-sage/10 text-sage-dark",
				headerBg: "bg-sage",
			};
	}
};

export async function EmergencyDetail({ alertId }: EmergencyDetailProps) {
	const alert = await getAnnouncementById(alertId);

	if (!alert) {
		notFound();
	}

	const Icon = getLevelIcon(alert.level);
	const colors = getLevelColors(alert.level);
	const isActive =
		alert.isActive &&
		(!alert.startsAt || new Date(alert.startsAt) <= new Date()) &&
		(!alert.endsAt || new Date(alert.endsAt) >= new Date());

	// Parse affectedAreas from JSON field
	const affectedAreas: string[] = Array.isArray(alert.affectedAreas)
		? (alert.affectedAreas as string[])
		: [];

	// contactInfo is a group { name, phone, email } in Payload
	const contactInfo = alert.contactInfo as { name?: string; phone?: string; email?: string } | null | undefined;
	const hasContactInfo = contactInfo && (contactInfo.name || contactInfo.phone || contactInfo.email);

	return (
		<div className="space-y-6">
			{/* Alert Header */}
			<Card className={`border-l-8 ${colors.border} ${colors.bg}`}>
				<CardHeader className="pb-4">
					<div className="flex items-start gap-4">
						<Icon className={`h-8 w-8 ${colors.icon} flex-shrink-0 mt-1`} />
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<span
									className={`px-3 py-1 rounded-full text-sm font-bold ${colors.badge} uppercase`}
								>
									{alert.level}
								</span>
								{isActive && (
									<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
										ACTIVE
									</span>
								)}
								{!isActive && (
									<span className="px-3 py-1 bg-stone text-[#4A4640] rounded-full text-sm font-bold">
										INACTIVE
									</span>
								)}
							</div>
							<CardTitle className={`text-2xl font-serif ${colors.text} mb-3`}>{alert.title}</CardTitle>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div className={`text-lg ${colors.text} leading-relaxed`}>
						<PayloadRichText content={alert.message as any} className="prose prose-lg max-w-none" />
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-6">
					{/* Instructions */}
					{alert.instructions && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg text-sage-dark font-serif">Instructions & Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="prose prose-sm max-w-none">
									<PayloadRichText content={alert.instructions as any} />
								</div>
							</CardContent>
						</Card>
					)}

					{/* External Link */}
					{alert.externalUrl && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg text-sage-dark font-serif">Additional Information</CardTitle>
							</CardHeader>
							<CardContent>
								<Button asChild variant="outline" className="w-full border-sage/30 hover:bg-sage/5 hover:text-sage-dark">
									<a
										href={alert.externalUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2"
									>
										<ExternalLink className="h-4 w-4" />
										View External Resource
									</a>
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					{/* Alert Timeline */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg text-sage-dark font-serif flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Alert Timeline
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3 text-sm">
								<Calendar className="h-4 w-4 text-[#635E56]" />
								<div>
									<div className="font-medium text-[#2D2A24]">Issued</div>
									<div className="text-[#4A4640]">{new Date(alert.createdAt).toLocaleString()}</div>
								</div>
							</div>

							{alert.startsAt && (
								<div className="flex items-center gap-3 text-sm">
									<Clock className="h-4 w-4 text-sage" />
									<div>
										<div className="font-medium text-[#2D2A24]">Active From</div>
										<div className="text-[#4A4640]">{new Date(alert.startsAt).toLocaleString()}</div>
									</div>
								</div>
							)}

							{alert.endsAt && (
								<div className="flex items-center gap-3 text-sm">
									<Clock className="h-4 w-4 text-barn-red" />
									<div>
										<div className="font-medium text-[#2D2A24]">Active Until</div>
										<div className="text-[#4A4640]">{new Date(alert.endsAt).toLocaleString()}</div>
									</div>
								</div>
							)}

							{alert.updatedAt && alert.updatedAt !== alert.createdAt && (
								<div className="flex items-center gap-3 text-sm">
									<Clock className="h-4 w-4 text-sage" />
									<div>
										<div className="font-medium text-[#2D2A24]">Last Updated</div>
										<div className="text-[#4A4640]">
											{new Date(alert.updatedAt).toLocaleString()}
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Affected Areas */}
					{affectedAreas.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg text-sage-dark font-serif flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Affected Areas
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-1">
									{affectedAreas.map((area, index) => (
										<li key={index} className="text-sm text-[#4A4640] flex items-center gap-2">
											<span className="w-1.5 h-1.5 bg-sage rounded-full" />
											{area}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					)}

					{/* Contact Information */}
					{hasContactInfo && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg text-sage-dark font-serif flex items-center gap-2">
									<Phone className="h-5 w-5" />
									Emergency Contacts
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-[#4A4640] space-y-2">
									{contactInfo.name && <p className="font-medium text-[#2D2A24]">{contactInfo.name}</p>}
									{contactInfo.phone && (
										<p className="flex items-center gap-2">
											<span className="text-base">Phone:</span>
											<a href={`tel:${contactInfo.phone.replace(/[^\d+]/g, "")}`} className={`font-bold hover:underline ${contactInfo.phone === "911" ? "text-barn-red text-xl" : "text-sage text-lg"}`}>
												{contactInfo.phone}
											</a>
											<PhoneCopyButton phone={contactInfo.phone} label={contactInfo.name || "Emergency Contact"} />
										</p>
									)}
									{contactInfo.email && (
										<p className="text-sm">
											Email:{" "}
											<a href={`mailto:${contactInfo.email}`} className="text-sage hover:text-sage-dark hover:underline">
												{contactInfo.email}
											</a>
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Emergency Contacts */}
					<Card className="bg-red-50 border-red-200">
						<CardHeader>
							<CardTitle className="text-lg text-barn-red font-serif">Emergency Services</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<span className="inline-flex items-center gap-2">
									<a href="tel:911" className="text-barn-red font-bold text-2xl hover:underline">911</a>
									<PhoneCopyButton phone="911" label="911" tone="onLight" />
								</span>
								<div className="text-sm text-[#4A4640]">Police, Fire, Medical</div>
							</div>
							<div>
								<span className="inline-flex items-center gap-2">
									<a href="tel:3045550100" className="text-barn-red font-bold text-lg hover:underline">(304) 555-0100</a>
									<PhoneCopyButton phone="(304) 555-0100" label="Non-Emergency Line" tone="onLight" />
								</span>
								<div className="text-sm text-[#4A4640]">Non-life-threatening emergencies</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
