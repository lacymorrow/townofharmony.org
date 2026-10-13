import { ExternalLink, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CandidateCardProps {
  candidate: {
    id?: string | null;
    name: string;
    position: string;
    party?: string | null;
    photo?: { url?: string | null } | number | null;
    bio?: string | null;
    website?: string | null;
    sortOrder?: number | null;
  };
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  // Resolve photo URL from upload relation
  const photoUrl =
    typeof candidate.photo === "object" && candidate.photo?.url ? candidate.photo.url : null;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={candidate.name}
              className="h-16 w-16 rounded-full border-2 border-[#DDD7CC] object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone">
              <User className="h-8 w-8 text-[#635E56]" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{candidate.name}</CardTitle>
            <p className="mb-2 text-base text-[#4A4640]">{candidate.position}</p>
            {candidate.party && (
              <Badge variant="outline" className="text-xs">
                {candidate.party}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {candidate.bio && (
          <div>
            <p className="text-base leading-relaxed text-[#4A4640]">
              {candidate.bio.length > 300 ? `${candidate.bio.substring(0, 300)}...` : candidate.bio}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t pt-2">
          {candidate.website && (
            <a
              href={candidate.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-600 hover:text-green-700"
            >
              <ExternalLink className="h-3 w-3" />
              Website
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
