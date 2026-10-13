"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const categories = [
  { value: "restaurant", label: "Restaurants & Food" },
  { value: "retail", label: "Retail & Shopping" },
  { value: "service", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "realestate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

export function BusinessFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get("category") || "";
  const showFeatured = searchParams?.get("featured") === "true";

  const updateCategory = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/business?${params.toString()}`);
  };

  const toggleFeatured = (checked: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (checked) {
      params.set("featured", "true");
    } else {
      params.delete("featured");
    }
    params.delete("page");
    router.push(`/business?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("category");
    params.delete("featured");
    params.delete("page");
    router.push(`/business?${params.toString()}`);
  };

  const hasFilters = currentCategory || showFeatured;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Businesses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Category</Label>
          <RadioGroup value={currentCategory || "all"} onValueChange={updateCategory}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer font-normal">
                All Categories
              </Label>
            </div>
            {categories.map((cat) => (
              <div key={cat.value} className="flex items-center space-x-2">
                <RadioGroupItem value={cat.value} id={cat.value} />
                <Label htmlFor={cat.value} className="cursor-pointer font-normal">
                  {cat.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="featured" checked={showFeatured} onCheckedChange={toggleFeatured} />
            <Label htmlFor="featured" className="cursor-pointer font-normal">
              Featured businesses only
            </Label>
          </div>
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear all filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
