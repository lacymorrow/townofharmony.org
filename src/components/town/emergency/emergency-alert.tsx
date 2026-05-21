import { AlertOctagon, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
interface EmergencyAlertData {
	title: string;
	message: string;
	level: "info" | "warning" | "critical";
	isActive: boolean;
	startsAt: Date | null;
	endsAt: Date | null;
	affectedAreas: string[] | null;
	instructions: string | null;
	contactInfo: unknown;
	externalUrl: string | null;
}

interface EmergencyAlertProps {
	alert: EmergencyAlertData;
	showDismiss?: boolean;
	onDismiss?: () => void;
	compact?: boolean;
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
			};
		case "warning":
			return {
				bg: "bg-amber-50",
				border: "border-amber-200",
				text: "text-amber-900",
				icon: "text-amber-600",
			};
		case "info":
		default:
			return {
				bg: "bg-sage/5",
				border: "border-sage/20",
				text: "text-sage-dark",
				icon: "text-sage",
			};
	}
};

export const EmergencyAlert = ({
	alert,
	showDismiss = false,
	onDismiss,
	compact = false,
}: EmergencyAlertProps) => {
	const Icon = getLevelIcon(alert.level);
	const colors = getLevelColors(alert.level);

	return (
		<Card className={`${colors.bg} ${colors.border} border-2`}>
			<CardContent className={`${compact ? "p-3" : "p-4"}`}>
				<div className="flex items-start gap-3">
					<Icon className={`h-5 w-5 ${colors.icon} flex-shrink-0 mt-0.5`} aria-hidden="true" />

					<div className="flex-1 min-w-0">
						<h3 className={`font-semibold ${colors.text} ${compact ? "text-sm" : "text-base"}`}>
							{alert.title}
						</h3>

						<p className={`${colors.text} ${compact ? "text-sm" : "text-base"} mt-1`}>
							{alert.message}
						</p>

						{!compact && alert.instructions && (
							<div className={`mt-3 p-3 bg-white/50 rounded ${colors.text} text-sm`}>
								<strong>Instructions: </strong>
								{alert.instructions}
							</div>
						)}

						{!compact && alert.affectedAreas && alert.affectedAreas.length > 0 && (
							<div className="mt-2">
								<span className={`text-sm ${colors.text}`}>
									Affected areas: {alert.affectedAreas.join(", ")}
								</span>
							</div>
						)}

						{alert.externalUrl && (
							<div className="mt-3">
								<a
									href={alert.externalUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={`inline-flex items-center text-sm underline hover:no-underline ${colors.text} font-medium`}
								>
									Learn more
								</a>
							</div>
						)}

						{!!alert.contactInfo && (
							<div className="mt-3 text-sm text-[#4A4640]">
								Contact:{" "}
								{typeof alert.contactInfo === "string"
									? alert.contactInfo
									: JSON.stringify(alert.contactInfo)}
							</div>
						)}

						<div className="mt-2 text-sm text-[#635E56]">
							{alert.startsAt && (
								<span>Active from {new Date(alert.startsAt).toLocaleString()}</span>
							)}
							{alert.endsAt && (
								<span>
									{alert.startsAt ? " until " : "Until "}
									{new Date(alert.endsAt).toLocaleString()}
								</span>
							)}
						</div>
					</div>

					{showDismiss && onDismiss && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onDismiss}
							aria-label="Dismiss alert"
							className={`h-6 w-6 p-0 ${colors.text} hover:bg-white/20`}
						>
							<X className="h-4 w-4" aria-hidden="true" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
