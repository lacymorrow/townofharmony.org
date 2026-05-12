import { ExternalLink, FileText, Headphones, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentViewerDialog } from "@/components/town/document-viewer-dialog";

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
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					Meeting Documents & Media
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Agenda */}
				{meeting.agendaUrl && (
					<div className="flex items-center justify-between p-3 border rounded-lg">
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-sage" />
							<div>
								<h4 className="font-medium">Meeting Agenda</h4>
								<p className="text-sm text-muted-foreground">Agenda for {meeting.title}</p>
							</div>
						</div>
						<DocumentViewerDialog url={meeting.agendaUrl} title={`Agenda - ${meeting.title}`}>
							<Button size="sm" variant="outline" className="flex items-center gap-2">
								<ExternalLink className="h-4 w-4" />
								View
							</Button>
						</DocumentViewerDialog>
					</div>
				)}

				{/* Minutes */}
				{meeting.minutesUrl && (
					<div className="flex items-center justify-between p-3 border rounded-lg">
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-green-600" />
							<div>
								<h4 className="font-medium">Meeting Minutes</h4>
								<p className="text-sm text-muted-foreground">
									Official minutes for {meeting.title}
								</p>
							</div>
						</div>
						<DocumentViewerDialog url={meeting.minutesUrl} title={`Minutes - ${meeting.title}`}>
							<Button size="sm" variant="outline" className="flex items-center gap-2">
								<ExternalLink className="h-4 w-4" />
								View
							</Button>
						</DocumentViewerDialog>
					</div>
				)}

				{/* Video Recording */}
				{meeting.videoUrl && (
					<div className="flex items-center justify-between p-3 border rounded-lg">
						<div className="flex items-center gap-3">
							<Video className="h-5 w-5 text-red-600" />
							<div>
								<h4 className="font-medium">Video Recording</h4>
								<p className="text-sm text-muted-foreground">Watch the full meeting recording</p>
							</div>
						</div>
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
					</div>
				)}

				{/* Audio Recording */}
				{meeting.audioUrl && (
					<div className="flex items-center justify-between p-3 border rounded-lg">
						<div className="flex items-center gap-3">
							<Headphones className="h-5 w-5 text-purple-600" />
							<div>
								<h4 className="font-medium">Audio Recording</h4>
								<p className="text-sm text-muted-foreground">Listen to the meeting audio</p>
							</div>
						</div>
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
					</div>
				)}

				{/* Additional Documents */}
				{meeting.documents && meeting.documents.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-medium text-sm">Additional Documents:</h4>
						{meeting.documents.map((doc, index) => (
							<div key={index} className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-3">
									<FileText className="h-5 w-5 text-[#4A4640]" />
									<div>
										<h4 className="font-medium">Document {index + 1}</h4>
										<p className="text-sm text-muted-foreground">Additional meeting document</p>
									</div>
								</div>
								<DocumentViewerDialog url={doc} title={`Document ${index + 1} - ${meeting.title}`}>
									<Button size="sm" variant="outline" className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										View
									</Button>
								</DocumentViewerDialog>
							</div>
						))}
					</div>
				)}

				{/* Inline Content */}
				<div className="space-y-4">
					{meeting.agenda && (
						<div className="p-4 bg-cream rounded-lg border border-[#DDD7CC]">
							<h4 className="font-medium mb-2 text-[#2D2A24]">Agenda Content</h4>
							<div className="prose prose-sm max-w-none text-[#2D2A24]">
								<div dangerouslySetInnerHTML={{ __html: meeting.agenda }} />
							</div>
						</div>
					)}

					{meeting.minutes && (
						<div className="p-4 bg-green-50 rounded-lg border border-green-200">
							<h4 className="font-medium mb-2 text-green-900">Minutes Content</h4>
							<div className="prose prose-sm max-w-none text-green-800">
								<div dangerouslySetInnerHTML={{ __html: meeting.minutes }} />
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
