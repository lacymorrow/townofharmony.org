import { ArrowRight, Calendar, Eye, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightboxImage } from "@/components/ui/lightbox-image";
import { getNews } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { htmlToPlainText } from "@/lib/html-to-text";
import { getMediaUrl } from "@/lib/utils/get-media-url";

const ITEMS_PER_PAGE = 9;

interface NewsGridProps {
  page: number;
  category?: string;
  search?: string;
}

export async function NewsGrid({ page, category, search }: NewsGridProps) {
  const result = await getNews({
    page,
    limit: ITEMS_PER_PAGE,
    category: category || undefined,
    search: search || undefined,
  });

  const articles = result.docs;
  const total = result.totalDocs;

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-[#635E56]">No articles found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#4A4640]">
          Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, total)} of{" "}
          {total} articles
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const featuredImage = getMediaUrl(article.featuredImage);

          const excerptText =
            htmlToPlainText(article.excerpt as string) ||
            extractTextFromRichText(article.content as any)?.substring(0, 150) + "...";

          return (
            <Card
              key={article.id}
              className="flex h-full flex-col transition-shadow hover:shadow-lg"
            >
              {featuredImage && (
                <LightboxImage
                  src={featuredImage}
                  alt={article.title}
                  wrapperClassName="h-48 rounded-t-lg"
                  className="h-full w-full object-cover"
                />
              )}

              <CardHeader className="flex-1">
                <CardTitle className="line-clamp-2 text-lg">
                  <Link
                    href={`/news/${article.slug}`}
                    className="transition-colors hover:text-sage-dark"
                  >
                    {article.title}
                  </Link>
                </CardTitle>

                <div className="mt-2 flex items-center gap-4 text-sm text-[#635E56]">
                  {article.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}

                  {article.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {typeof article.author === "object"
                        ? (article.author as any).name || "Staff"
                        : String(article.author)}
                    </div>
                  )}

                  {(article.viewCount as number) > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount as number}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className="mb-4 line-clamp-3 text-base text-[#4A4640]">{excerptText}</p>

                {article.categories && (article.categories as string[]).length > 0 && (
                  <div className="mb-3 flex gap-1">
                    {(article.categories as string[]).slice(0, 2).map((cat) => (
                      <span key={cat} className="rounded bg-stone px-2 py-1 text-xs text-[#4A4640]">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium font-semibold text-sage hover:text-sage-dark"
                  aria-label={`Read more about ${article.title}`}
                >
                  Read more
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
