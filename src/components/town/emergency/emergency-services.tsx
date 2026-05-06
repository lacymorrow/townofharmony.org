import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmergencyServices } from "@/lib/town-data";
import { resolveIcon } from "@/lib/utils/icon-resolver";

const categoryColors: Record<string, string> = {
	immediate: "border-red-200 bg-red-50",
	utility: "border-amber-200 bg-amber-50",
	"public-safety": "border-sage/20 bg-sage/5",
	health: "border-green-200 bg-green-50",
};

const categoryTitles: Record<string, string> = {
	immediate: "Immediate Emergency Response",
	utility: "Utility Services",
	"public-safety": "Public Safety",
	health: "Health & Wellness",
};

export const EmergencyServices = async () => {
	const services = await getEmergencyServices();

	if (services.length === 0) {
		return (
			<Card className="border-stone bg-warm-white">
				<CardContent className="py-12 text-center">
					<div className="flex flex-col items-center gap-4">
						<Info className="h-12 w-12 text-sage-light" />
						<div>
							<h3 className="text-lg font-semibold text-sage-dark mb-2">No Emergency Services</h3>
							<p className="text-[#4A4640]">Emergency services information is not available.</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Group services by category
	const groupedServices = services.reduce(
		(acc, service) => {
			const category = service.category || "immediate";
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(service);
			return acc;
		},
		{} as Record<string, typeof services>
	);

	return (
		<div className="space-y-8">
			{Object.entries(groupedServices).map(([category, categoryServices]) => (
				<div key={category}>
					<h2 className="text-2xl font-serif font-bold text-sage-dark mb-4">
						{categoryTitles[category] || category}
					</h2>

					<div className="grid gap-4 md:grid-cols-2">
						{categoryServices.map((service) => {
							const Icon = resolveIcon(service.icon as string | null | undefined);
							const colorClass = categoryColors[category] || "border-stone bg-cream";

							// Parse preparedness tips from JSON field
							const preparedness: string[] = Array.isArray(service.preparedness)
								? (service.preparedness as string[])
								: [];

							return (
								<Card
									key={service.id}
									className={`hover:shadow-lg transition-shadow border-2 ${colorClass}`}
								>
									<CardHeader className="pb-3">
										<div className="flex items-center gap-3">
											<Icon className="h-6 w-6 text-[#2D2A24]" />
											<CardTitle className="text-lg text-[#2D2A24]">{service.title}</CardTitle>
										</div>
									</CardHeader>

									<CardContent className="space-y-4">
										<p className="text-[#4A4640] text-base">{service.description}</p>

										<div className="flex items-center gap-2">
											<span className="font-semibold text-[#2D2A24]">Emergency Phone:</span>
											<a
												href={`tel:${service.phone}`}
												className="text-barn-red font-bold text-lg hover:underline"
											>
												{service.phone}
											</a>
										</div>

										{preparedness.length > 0 && (
											<div className="pt-3 border-t border-[#DDD7CC]">
												<h3 className="font-semibold text-[#2D2A24] mb-2 text-sm">
													Preparedness Tips:
												</h3>
												<ul className="text-sm text-[#4A4640] space-y-1">
													{preparedness.map((tip, tipIndex) => (
														<li key={tipIndex} className="flex items-start gap-2">
															<span className="text-[#635E56] mt-1">&bull;</span>
															<span>{tip}</span>
														</li>
													))}
												</ul>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			))}

			<Card className="bg-wheat/10 border-wheat/30 border-2">
				<CardContent className="p-6">
					<h3 className="font-bold text-sage-dark mb-3 text-lg font-serif">
						Stay Connected During Emergencies
					</h3>
					<div className="space-y-2 text-base text-[#4A4640]">
						<p>
							<strong className="text-[#2D2A24]">Social Media:</strong> Follow Town of Harmony on Facebook for real-time updates
						</p>
						<p>
							<strong className="text-[#2D2A24]">Website:</strong> Visit townofharmony.org/emergency for current information
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
