import { CheckCircle, Clock, Globe, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface BusinessCardProps {
	business: {
		id: number;
		name: string;
		slug: string;
		description: string | null;
		category: string;
		address: string | null;
		phone: string | null;
		email: string | null;
		website: string | null;
		hours: any;
		logo: string | null;
		isVerified: boolean | null;
		isFeatured: boolean | null;
	};
}

const categoryColors: Record<string, string> = {
	restaurant: "bg-orange-100 text-orange-800",
	retail: "bg-sage/10 text-sage-dark",
	service: "bg-purple-100 text-purple-800",
	healthcare: "bg-red-100 text-red-800",
	education: "bg-green-100 text-green-800",
	finance: "bg-yellow-100 text-yellow-800",
	realestate: "bg-indigo-100 text-indigo-800",
	other: "bg-stone text-[#2D2A24]",
};

export function BusinessCard({ business }: BusinessCardProps) {
	const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
	const todayHours = business.hours?.[today];

	return (
		<Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start gap-2">
					<div className="flex-1">
						<Link
							href={`/business/${business.slug}`}
							className="hover:text-sage-dark transition-colors"
						>
							<h3 className="font-semibold text-lg line-clamp-1">{business.name}</h3>
						</Link>
						<div className="flex items-center gap-2 mt-1">
							<Badge
								variant="secondary"
								className={categoryColors[business.category] || categoryColors.other}
							>
								{business.category}
							</Badge>
							{business.isVerified && (
								<>
									<CheckCircle className="h-4 w-4 text-sage" aria-hidden="true" />
									<span className="sr-only">Verified business</span>
								</>
							)}
							{business.isFeatured && (
								<>
									<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
									<span className="sr-only">Featured business</span>
								</>
							)}
						</div>
					</div>
					{business.logo && (
						<img
							src={business.logo}
							alt={`${business.name} logo`}
							className="w-12 h-12 object-contain rounded"
						/>
					)}
				</div>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col justify-between">
				{business.description && (
					<p className="text-sm text-muted-foreground line-clamp-2 mb-4">{business.description}</p>
				)}

				<div className="space-y-2 text-sm">
					{business.address && (
						<div className="flex items-start gap-2">
							<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
							<span className="line-clamp-2">{business.address}</span>
						</div>
					)}

					{business.phone && (
						<div className="flex items-center gap-2">
							<Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							<a href={`tel:${business.phone}`} className="hover:text-sage-dark transition-colors">
								{business.phone}
							</a>
						</div>
					)}

					{todayHours && (
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							<span>Today: {todayHours === "Closed" ? "Closed" : todayHours}</span>
						</div>
					)}

					{business.website && (
						<div className="flex items-center gap-2">
							<Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
							<a
								href={business.website}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-sage-dark transition-colors truncate"
							>
								Visit website
							</a>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
