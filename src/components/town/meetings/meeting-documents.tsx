import { Download, FileText, Headphones, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewer } from "@/components/town/document-viewer";

interface MeetingDocumentsProps {
	meeting: {
		id: number;
		title: string;
		agenda: string | null;
		agendaUrl: string | null;
		minutes: string | null;
		minutesUrl: string | null;
		videoUrl: string | null;
		audioUrl: string | null;
		documents: string[] | null;
	};
}

export function MeetingDocuments({ meeting }: MeetingDocumentsProps) {
	const hasAnyDocuments =
		meeting.agendaUrl ||
		meeting.minutesUrl ||
		meeting.videoUrl ||
		meeting.audioUrl ||
		(meeting.documents && meeting.documents.length > 0);

	if (!hasAnyDocuments) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Meeting Documents
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						No documents are currently available for this meeting.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Inline Agenda Viewer */}
			{meeting.agendaUrl && (
				<Card id="agenda">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-sage" />
								Meeting Agenda
							</CardTitle>
							<a
								href={meeting.agendaUrl}
								download
								className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
							>
								<Download className="h-4 w-4" />
								Download
							</a>
						</div>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-hidden bg-white h-[80vh]">
							<DocumentViewer url={meeting.agendaUrl} title={`Agenda - ${meeting.title}`} />
						</div>
					</CardContent>
				</Card>
			)}

			{/* Inline Minutes Viewer */}
			{meeting.minutesUrl && (
				<Card id="minutes">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-green-600" />
								Meeting Minutes
							</CardTitle>
							<a
								href={meeting.minutesUrl}
								download
								className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
							>
								<Download className="h-4 w-4" />
								Download
							</a>
						</div>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-hidden bg-white h-[80vh]">
							<DocumentViewer url={meeting.minutesUrl} title={`Minutes - ${meeting.title}`} />
						</div>
					</CardContent>
				</Card>
			)}

			{/* Video Recording */}
			{meeting.videoUrl && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Video className="h-5 w-5 text-red-600" />
							Video Recording
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Button asChild size="sm" variant="outline">
							<a
								href={meeting.videoUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2"
							>
								<Video className="h-4 w-4" />
								Watch
							</a>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Audio Recording */}
			{meeting.audioUrl && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Headphones className="h-5 w-5 text-purple-600" />
							Audio Recording
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Button asChild size="sm" variant="outline">
							<a
								href={meeting.audioUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2"
							>
								<Headphones className="h-4 w-4" />
								Listen
							</a>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Additional Documents */}
			{meeting.documents && meeting.documents.length > 0 &&
				meeting.documents.map((doc, index) => (
					<Card key={index} id={`doc-${index}`}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-[#4A4640]" />
									Document {index + 1}
								</CardTitle>
								<a
									href={doc}
									download
									className="inline-flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium"
								>
									<Download className="h-4 w-4" />
									Download
								</a>
							</div>
						</CardHeader>
						<CardContent>
							<div className="border rounded-lg overflow-hidden bg-white h-[80vh]">
								<DocumentViewer url={doc} title={`Document ${index + 1} - ${meeting.title}`} />
							</div>
						</CardContent>
					</Card>
				))}

			{/* Inline Content (if plain text content exists) */}
			{meeting.agenda && (
				<div className="p-4 bg-cream rounded-lg border border-[#DDD7CC]">
					<h4 className="font-medium mb-2 text-[#2D2A24]">Agenda Content</h4>
					<p className="text-sm text-[#2D2A24] whitespace-pre-line">{meeting.agenda}</p>
				</div>
			)}

			{meeting.minutes && (
				<div className="p-4 bg-green-50 rounded-lg border border-green-200">
					<h4 className="font-medium mb-2 text-green-900">Minutes Content</h4>
					<p className="text-sm text-green-800 whitespace-pre-line">{meeting.minutes}</p>
				</div>
			)}
		</div>
	);
}
