"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";

export function Categories() {
  const { categories, loading: categoriesLoading, error } = useCategories();

  if (categoriesLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Product Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of robotics solutions across
              different industries and applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="bg-gray-300 h-40 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-6 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Product Categories</h2>
            <p className="text-red-600">Failed to load categories</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Product Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of robotics solutions across
            different industries and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category.category_id} category={category} />
          ))}
        </div>

        {categories.length > 4 && (
          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
}: {
  category: { category_id: number; name: string; description?: string };
}) {
  const { products } = useProducts({
    category: category.category_id.toString(),
    limit: 1,
  });

  return (
    <Link href={`/products?category=${category.category_id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <img
            src="/placeholder.svg"
            alt={category.name}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{category.description}</p>
          <p className="text-blue-600 font-medium">View products</p>
        </CardContent>
      </Card>
    </Link>
  );
}
