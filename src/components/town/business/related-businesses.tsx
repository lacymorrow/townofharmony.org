import Link from "next/link";
import { getBusinesses } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RelatedBusinessesProps {
  currentBusinessId: number;
  category: string;
}

export async function RelatedBusinesses({ currentBusinessId, category }: RelatedBusinessesProps) {
  const result = await getBusinesses({
    category,
    limit: 6,
    page: 1,
  });

  // Filter out the current business from results
  const related = result.docs.filter((b) => b.id !== currentBusinessId).slice(0, 5);

  if (related.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Businesses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {related.map((business) => {
            const descriptionText = extractTextFromRichText(business.description as any);
            return (
              <div key={business.id} className="border-b pb-4 last:border-0">
                <Link
                  href={`/business/${business.slug}`}
                  className="block transition-colors hover:text-sage-dark"
                >
                  <h4 className="mb-1 font-medium">{business.name}</h4>
                  {descriptionText && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {descriptionText}
                    </p>
                  )}
                  {business.isVerified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
