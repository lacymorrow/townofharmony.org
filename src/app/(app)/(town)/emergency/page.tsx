import { AlertTriangle, Info, Phone, Shield } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmergencyAlertsList } from "@/components/town/emergency/emergency-alerts-list";
import { EmergencyContacts } from "@/components/town/emergency/emergency-contacts";
import { EmergencyServices } from "@/components/town/emergency/emergency-services";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
	title: "Emergency Information | Town of Harmony",
	description:
		"Emergency services, contacts, and active alerts for the Town of Harmony, NC.",
};

export default function EmergencyPage() {
	if (process.env.NEXT_PUBLIC_FEATURE_ALERTS_ENABLED !== "true") {
		notFound();
	}
	return (
		<div className="min-h-screen bg-cream">
			<div className="container mx-auto px-4 py-8">
				{/* Red header banner */}
				<div className="bg-barn-red text-white rounded-lg p-6 mb-8">
					<div className="flex items-center gap-3 mb-4">
						<AlertTriangle className="h-8 w-8" />
						<h1 className="text-3xl font-serif font-bold">Emergency Information</h1>
					</div>
					<p className="text-white/90 text-lg">
						Stay informed and prepared with official emergency information for the Town of Harmony.
					</p>
					<p className="text-white font-semibold mt-3">
						Life-threatening emergency? Call{" "}
						<a href="tel:911" className="font-bold text-3xl md:text-4xl hover:underline">911</a>
					</p>
				</div>

				{/* Active alerts — only rendered when alerts exist */}
				<Suspense fallback={null}>
					<EmergencyAlertsList activeOnly={true} limit={5} />
				</Suspense>

				{/* Main content tabs */}
				<Tabs defaultValue="services" className="w-full">
					<TabsList className="grid w-full grid-cols-3 bg-stone h-auto p-1.5">
						<TabsTrigger
							value="services"
							className="flex items-center gap-2 py-2.5 text-[#4A4640] data-[state=active]:bg-warm-white data-[state=active]:text-sage-dark data-[state=active]:shadow-sm"
						>
							<Shield className="h-4 w-4" />
							Emergency Services
						</TabsTrigger>
						<TabsTrigger
							value="contacts"
							className="flex items-center gap-2 py-2.5 text-[#4A4640] data-[state=active]:bg-warm-white data-[state=active]:text-sage-dark data-[state=active]:shadow-sm"
						>
							<Phone className="h-4 w-4" />
							Emergency Contacts
						</TabsTrigger>
						<TabsTrigger
							value="preparedness"
							className="flex items-center gap-2 py-2.5 text-[#4A4640] data-[state=active]:bg-warm-white data-[state=active]:text-sage-dark data-[state=active]:shadow-sm"
						>
							<Info className="h-4 w-4" />
							Preparedness
						</TabsTrigger>
					</TabsList>

					<TabsContent value="services" className="mt-6">
						<Suspense
							fallback={
								<Card>
									<CardContent className="py-12">
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
											<span className="ml-2 text-[#4A4640]">Loading emergency services...</span>
										</div>
									</CardContent>
								</Card>
							}
						>
							<EmergencyServices />
						</Suspense>
					</TabsContent>

					<TabsContent value="contacts" className="mt-6">
						<EmergencyContacts />
					</TabsContent>

					<TabsContent value="preparedness" className="mt-6">
						<div className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<h3 className="text-xl font-serif font-bold text-sage-dark mb-4">
										Emergency Preparedness Kit
									</h3>
									<div className="grid md:grid-cols-2 gap-6">
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">
												Basic Supplies (72-hour kit):
											</h4>
											<ul className="space-y-1 text-sm text-[#4A4640]">
												<li>• Water (1 gallon per person per day)</li>
												<li>• Non-perishable food</li>
												<li>• Battery-powered or hand crank radio</li>
												<li>• Flashlights and extra batteries</li>
												<li>• First aid kit</li>
												<li>• Cell phone with chargers</li>
												<li>• Cash and credit cards</li>
												<li>• Emergency contact information</li>
											</ul>
										</div>
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Additional Items:</h4>
											<ul className="space-y-1 text-sm text-[#4A4640]">
												<li>• Prescription medications</li>
												<li>• Blankets and clothing</li>
												<li>• Important documents (copies)</li>
												<li>• Fire extinguisher</li>
												<li>• Matches in waterproof container</li>
												<li>• Personal hygiene items</li>
												<li>• Tools and supplies (wrench, duct tape)</li>
												<li>• Pet supplies if needed</li>
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<h3 className="text-xl font-serif font-bold text-sage-dark mb-4">Home Emergency Plan</h3>
									<div className="space-y-4 text-sm text-[#4A4640]">
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">
												Create a Family Communication Plan:
											</h4>
											<ul className="space-y-1">
												<li>• Identify an out-of-area contact person</li>
												<li>• Choose two meeting places (near home and outside neighborhood)</li>
												<li>• Learn important telephone numbers by heart</li>
												<li>• Keep contact information updated</li>
											</ul>
										</div>
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Know Your Home:</h4>
											<ul className="space-y-1">
												<li>• Locate main water shut-off valve</li>
												<li>• Know how to turn off gas at meter</li>
												<li>• Identify electrical panel location</li>
												<li>• Plan evacuation routes from each room</li>
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<h3 className="text-xl font-serif font-bold text-sage-dark mb-4">Weather Preparedness</h3>
									<div className="grid md:grid-cols-2 gap-6 text-sm text-[#4A4640]">
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Severe Thunderstorms:</h4>
											<ul className="space-y-1">
												<li>• Move to interior room on lowest floor</li>
												<li>• Stay away from windows</li>
												<li>• Unplug electrical appliances</li>
												<li>• Avoid using landline phones</li>
											</ul>

											<h4 className="font-semibold text-[#2D2A24] mb-2 mt-4">Winter Storms:</h4>
											<ul className="space-y-1">
												<li>• Insulate pipes to prevent freezing</li>
												<li>• Keep alternate heating source available</li>
												<li>• Stock up on food before storms</li>
												<li>• Keep car emergency kit updated</li>
											</ul>
										</div>
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Flooding:</h4>
											<ul className="space-y-1">
												<li>• Never drive through flooded roads</li>
												<li>• Move to higher ground immediately</li>
												<li>• Turn off utilities if instructed</li>
												<li>• Monitor emergency broadcasts</li>
											</ul>

											<h4 className="font-semibold text-[#2D2A24] mb-2 mt-4">Power Outages:</h4>
											<ul className="space-y-1">
												<li>• Use flashlights, not candles</li>
												<li>• Keep refrigerator and freezer closed</li>
												<li>• Use generators outside only</li>
												<li>• Check on neighbors, especially elderly</li>
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-sage/5 border-sage/20">
								<CardContent className="p-6">
									<h3 className="text-xl font-serif font-bold text-sage-dark mb-4">Stay Connected</h3>
									<div className="grid md:grid-cols-2 gap-6 text-sm text-[#4A4640]">
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Alert Systems:</h4>
											<ul className="space-y-1">
												<li>• Download FEMA app for warnings</li>
												<li>• Enable Wireless Emergency Alerts on your phone</li>
												<li>• Follow the Town of Harmony on social media</li>
											</ul>
										</div>
										<div>
											<h4 className="font-semibold text-[#2D2A24] mb-2">Local Information:</h4>
											<ul className="space-y-1">
												<li>• TV and radio: Local news channels</li>
												<li>• NOAA Weather Radio: 162.550 MHz</li>
											</ul>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
