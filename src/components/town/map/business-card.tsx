"use client";

import { cn } from "@/lib/utils";
import type { MapBusiness } from "@/lib/map-utils";
import { getCategoryColor, getDirectionsUrl, getMapUrl } from "@/lib/map-utils";
import { MapPin, Phone, Navigation, Globe } from "lucide-react";
import { AddressCopyButton } from "@/components/town/address-copy-button";
import { PhoneCopyButton } from "@/components/town/phone-copy-button";

interface BusinessCardProps {
	business: MapBusiness;
	isSelected: boolean;
	onClick: () => void;
}

export const BusinessCard = ({ business, isSelected, onClick }: BusinessCardProps) => {
	const color = getCategoryColor(business.category);

	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full text-left rounded-lg p-3 transition-all border",
				isSelected
					? "bg-sage/10 border-sage/30 shadow-sm"
					: "bg-cream border-transparent hover:bg-stone/20 hover:border-stone/40",
			)}
			aria-label={`View ${business.name} on map`}
			aria-pressed={isSelected}
		>
			<div className="flex items-start gap-2.5">
				<span
					className="mt-1.5 inline-block h-2.5 w-2.5 rounded-full shrink-0"
					style={{ backgroundColor: color }}
					aria-hidden="true"
				/>
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-semibold text-[#2D2A24] leading-snug truncate">
						{business.name}
					</h3>
					<div className="flex items-center gap-1 mt-1">
						<MapPin className="h-3 w-3 text-[#635E56] shrink-0" aria-hidden="true" />
						<a
							href={getMapUrl(business.address)}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="text-sm text-[#635E56] leading-tight truncate hover:text-sage-dark transition-colors"
						>
							{business.address}
						</a>
						<AddressCopyButton
							address={business.address}
							label={business.name}
							tone="default"
							className="h-6 w-6"
							iconClassName="h-3.5 w-3.5"
						/>
					</div>
					{business.phone && (
						<div className="flex items-center gap-1 mt-0.5">
							<Phone className="h-3 w-3 text-[#635E56] shrink-0" aria-hidden="true" />
							<a
								href={`tel:+1${business.phone.replace(/\D/g, "")}`}
								onClick={(e) => e.stopPropagation()}
								className="text-sm text-[#635E56] hover:text-sage-dark transition-colors"
							>
								{business.phone}
							</a>
							<PhoneCopyButton
								phone={business.phone}
								label={business.name}
								tone="default"
								className="h-6 w-6"
								iconClassName="h-3.5 w-3.5"
							/>
						</div>
					)}
					<div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
						<span
							className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
							style={{ backgroundColor: color }}
						>
							{business.category}
						</span>
						{business.website && (
							<a
								href={business.website}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-sage-dark bg-stone/40 hover:bg-stone/60 transition-colors"
								aria-label={`Visit ${business.name} website`}
							>
								<Globe className="h-2.5 w-2.5" />
								Website
							</a>
						)}
						<a
							href={getDirectionsUrl(business.address)}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-sage-dark bg-stone/40 hover:bg-stone/60 transition-colors"
							aria-label={`Get directions to ${business.name}`}
						>
							<Navigation className="h-2.5 w-2.5" />
							Directions
						</a>
					</div>
				</div>
			</div>
		</button>
	);
};
