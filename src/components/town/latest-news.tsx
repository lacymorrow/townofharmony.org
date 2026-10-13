import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getNews } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { htmlToPlainText } from "@/lib/html-to-text";

export async function LatestNews() {
  const { docs: articles } = await getNews({ limit: 3 });

  if (articles.length === 0) {
    return null;
  }

  return (
    <div>
      {articles.map((article) => {
        const date = article.publishedAt ? new Date(article.publishedAt) : new Date();
        const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
        const day = date.getDate();

        return (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group flex cursor-pointer items-start gap-5 border-b border-[#DDD7CC] py-5 last:border-b-0"
          >
            {/* Date block */}
            <div className="min-w-[56px] flex-shrink-0 rounded-lg bg-sage-dark px-3 py-2 text-center text-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8D5A3]">
                {month}
              </div>
              <div className="text-[22px] font-bold leading-tight">{day}</div>
            </div>
            {/* Content */}
            <div className="flex-1">
              <h3 className="mb-1.5 text-[17px] font-semibold text-[#2D2A24] transition-colors group-hover:text-sage-dark">
                {article.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-[#4A4640]">
                {htmlToPlainText(article.excerpt) ||
                  extractTextFromRichText(article.content as any).substring(0, 150) + "..."}
              </p>
            </div>
          </Link>
        );
      })}

      <div className="pt-6">
        <Link
          href="/news"
          className="inline-flex cursor-pointer items-center gap-2 text-[15px] font-semibold text-sage transition-colors hover:text-sage-dark"
        >
          View All News
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
