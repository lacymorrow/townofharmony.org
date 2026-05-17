import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Community Center Reservation",
	description:
		"How to reserve the Harmony Community Center, including rules, capacity, and contact information.",
};

export default function CommunityCenterReservationPage() {
	return (
		<article className="py-12 bg-cream">
			<div className="container mx-auto px-4 max-w-3xl">
				<h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-dark mb-4">
					Community Center Reservation
				</h1>
				<p className="text-[#2D2A24] mb-6">
					The Harmony Community Center may be reserved for community gatherings,
					private events, and meetings. To request a reservation, please contact
					Town Hall directly:
				</p>

				<div className="bg-white border border-stone rounded p-5 mb-8">
					<p className="font-semibold">Town Hall</p>
					<p>
						<a
							href="tel:7045462339"
							className="text-sage-dark hover:underline"
						>
							(704) 546-2339
						</a>
					</p>
					<p className="text-sm text-[#4A4640] mt-2">
						3389 Harmony Hwy, Harmony, NC 28634<br />
						Monday – Friday, 9:00 AM – 5:00 PM
					</p>
				</div>

				<h2 className="text-2xl font-serif font-bold text-sage-dark mb-3">
					Equipment Included
				</h2>
				<ul className="list-disc list-inside space-y-1 text-[#2D2A24] mb-6">
					<li>Tables and chairs for up to 120 guests</li>
					<li>Children's high chairs</li>
					<li>Electric range, microwave, refrigerator</li>
					<li>Paper towels, trash bags, broom, mop</li>
				</ul>
				<p className="text-sm text-[#4A4640] mb-6">
					No cleaning supplies, dishcloths, eating/serving utensils, dishes, or
					glasses are provided. Grills are furnished in the park; personal
					grills and fryers are not allowed on the premises.
				</p>

				<h2 className="text-2xl font-serif font-bold text-sage-dark mb-3">
					Reservation Rules
				</h2>
				<ul className="list-disc list-inside space-y-1 text-[#2D2A24] mb-6">
					<li>Available for rental between 10:00 AM and 10:00 PM</li>
					<li>Reservation application and payment must be received when the reservation is made</li>
					<li>Cancellation must be made no less than 30 days before the reservation date</li>
					<li>Maximum capacity per Fire Code: 120 people</li>
					<li>Application does not include the Tomlinson-Moore Family Park picnic shelter (separate application)</li>
					<li>No alcohol, drugs, firearms, or animals</li>
					<li>No loud noise — only small stereo systems permitted</li>
					<li>No smoking inside the Community Center</li>
					<li>No nails, screws, staples, or tape on walls, woodwork, floors, or ceiling</li>
					<li>Day-before decoration available 3:00 PM – 5:00 PM for an additional $50 (only if the building is unrented that day)</li>
				</ul>


			</div>
		</article>
	);
}
