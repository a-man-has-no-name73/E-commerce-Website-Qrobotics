"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";

interface ProductFiltersProps {
  filters: {
    category: string;
    priceRange: string;
    inStock: boolean;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ProductFilters({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const { categories, loading: categoriesLoading } = useCategories();

  const priceRanges = [
    { id: "0-5000", name: "Under ৳5,000" },
    { id: "5000-15000", name: "৳5,000 - ৳15,000" },
    { id: "15000-50000", name: "৳15,000 - ৳50,000" },
    { id: "50000", name: "৳50,000+" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-300 h-4 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={filters.category}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, category: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="all" />
                <Label htmlFor="all">All Categories</Label>
              </div>
              {categories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem
                    value={category.category_id.toString()}
                    id={category.category_id.toString()}
                  />
                  <Label htmlFor={category.category_id.toString()}>
                    {category.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={filters.priceRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, priceRange: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-prices" />
              <Label htmlFor="all-prices">All Prices</Label>
            </div>
            {priceRanges.map((range) => (
              <div key={range.id} className="flex items-center space-x-2">
                <RadioGroupItem value={range.id} id={range.id} />
                <Label htmlFor={range.id}>{range.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, inStock: checked as boolean })
              }
            />
            <Label htmlFor="in-stock">In Stock Only</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
