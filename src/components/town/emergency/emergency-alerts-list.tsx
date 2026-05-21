import { AlertOctagon, AlertTriangle, Calendar, Info, MapPin } from "lucide-react";
import Link from "next/link";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncements } from "@/lib/town-data";

interface EmergencyAlertsListProps {
	showAll?: boolean;
	limit?: number;
	activeOnly?: boolean;
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
			};
		case "warning":
			return {
				bg: "bg-amber-50",
				border: "border-amber-200",
				text: "text-amber-900",
				icon: "text-amber-600",
				badge: "bg-amber-100 text-amber-900",
			};
		case "info":
		default:
			return {
				bg: "bg-sage/5",
				border: "border-sage/20",
				text: "text-sage-dark",
				icon: "text-sage",
				badge: "bg-sage/10 text-sage-dark",
			};
	}
};

export async function EmergencyAlertsList({
	showAll = false,
	limit = 10,
	activeOnly = false,
}: EmergencyAlertsListProps) {
	const result = await getAnnouncements({
		limit: showAll ? 100 : limit,
		activeOnly,
	});

	const alerts = result.docs;

	if (alerts.length === 0) {
		return null;
	}

	return (
		<section className="mb-8 space-y-4">
			{alerts.map((alert) => {
				const Icon = getLevelIcon(alert.level);
				const colors = getLevelColors(alert.level);
				const isActive =
					alert.isActive &&
					(!alert.startsAt || new Date(alert.startsAt) <= new Date()) &&
					(!alert.endsAt || new Date(alert.endsAt) >= new Date());

				const messageText = extractTextFromRichText(alert.content);

				// Parse affectedAreas from JSON field
				const affectedAreas: string[] = Array.isArray(alert.affectedAreas)
					? (alert.affectedAreas as string[])
					: [];

				return (
					<Card
						key={alert.id}
						className={`hover:shadow-lg transition-shadow border-l-4 ${
							isActive
								? `${colors.border} ${colors.bg} border-l-current`
								: "border-stone bg-cream border-l-[#635E56]"
						}`}
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1">
									<Icon className={`h-5 w-5 mt-0.5 ${isActive ? colors.icon : "text-[#635E56]"}`} aria-hidden="true" />
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<CardTitle className={`text-lg ${isActive ? colors.text : "text-[#4A4640]"}`}>
												{alert.title}
											</CardTitle>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													isActive ? colors.badge : "bg-stone text-[#4A4640]"
												}`}
											>
												{alert.level.toUpperCase()}
											</span>
											{isActive && (
												<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
													ACTIVE
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-3">
							<p className={`text-base ${isActive ? colors.text : "text-[#4A4640]"}`}>
								{messageText}
							</p>

							{affectedAreas.length > 0 && (
								<div className="flex items-center gap-2 text-sm text-[#4A4640]">
									<MapPin className="h-4 w-4" aria-hidden="true" />
									<span>Affected areas: {affectedAreas.join(", ")}</span>
								</div>
							)}

							<div className="flex items-center justify-between pt-2 border-t border-[#DDD7CC]">
								<div className="flex items-center gap-4 text-sm text-[#635E56]">
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" aria-hidden="true" />
										<span>Issued {new Date(alert.createdAt).toLocaleString()}</span>
									</div>

									{alert.startsAt && (
										<span>Active from {new Date(alert.startsAt).toLocaleString()}</span>
									)}

									{alert.endsAt && <span>Until {new Date(alert.endsAt).toLocaleString()}</span>}
								</div>

								<Link
									href="/emergency"
									className={`text-sm font-medium hover:underline ${
										isActive ? colors.text : "text-sage font-semibold hover:text-sage-dark"
									}`}
								>
									View Details &rarr;
								</Link>
							</div>
						</CardContent>
					</Card>
				);
			})}

			{!showAll && alerts.length === limit && (
				<div className="text-center pt-4">
					<Link
						href="/emergency"
						className="inline-flex items-center gap-2 text-sage font-semibold hover:text-sage-dark transition-colors"
					>
						View All Emergency Alerts
						<Calendar className="h-4 w-4" aria-hidden="true" />
					</Link>
				</div>
			)}
		</section>
	);
}
