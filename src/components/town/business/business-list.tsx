import { getBusinesses } from "@/lib/town-data";
import { extractTextFromRichText } from "@/components/town/payload-rich-text";
import { BusinessCard } from "./business-card";
import { BusinessPagination } from "./business-pagination";
import { getMediaUrl } from "@/lib/utils/get-media-url";

interface BusinessListProps {
  category?: string;
  search?: string;
  featured?: string;
  page?: string;
}

export async function BusinessList({ category, search, featured, page = "1" }: BusinessListProps) {
  const pageSize = 12;
  const currentPage = Number.parseInt(page) || 1;

  const result = await getBusinesses({
    category,
    search,
    featured: featured === "true" ? true : undefined,
    limit: pageSize,
    page: currentPage,
  });

  const { docs: items, totalDocs, totalPages } = result;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {search ? `No businesses found matching "${search}"` : "No businesses found."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {items.length} of {totalDocs} businesses
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((business) => (
          <BusinessCard
            key={business.id}
            business={{
              id: business.id,
              name: business.name,
              slug: business.slug,
              description: extractTextFromRichText(business.description as any) || null,
              category: business.category,
              address: business.address ?? null,
              phone: business.phone ?? null,
              email: business.email ?? null,
              website: business.website ?? null,
              hours: business.hours,
              logo: getMediaUrl(business.logo),
              isVerified: business.isVerified ?? null,
              isFeatured: business.isFeatured ?? null,
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <BusinessPagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/business"
          searchParams={{ category, search, featured }}
        />
      )}
    </>
  );
}
