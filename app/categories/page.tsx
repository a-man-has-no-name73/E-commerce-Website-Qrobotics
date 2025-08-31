"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";

interface CategoryImage {
  id: number;
  url: string;
  publicId: string;
  fileName: string;
  isPrimary: boolean;
  createdAt: string;
}

interface Category {
  category_id: number;
  name: string;
  description?: string;
  created_at: string;
  images?: CategoryImage[];
  primaryImage?: CategoryImage;
}

export default function CategoriesPage() {
  const { categories, loading: categoriesLoading, error } = useCategories();

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Explore our comprehensive range of robotics solutions across
                different industries and applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
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
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
              <p className="text-red-600">Failed to load categories</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our comprehensive range of robotics solutions across
              different industries and applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.category_id} category={category} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const { products, loading } = useProducts({
    category: category.category_id.toString(),
    limit: 3,
  });

  return (
    <Link href={`/products?category=${category.category_id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="relative mb-4">
            {category.primaryImage ? (
              <Image
                src={category.primaryImage.url}
                alt={category.name}
                width={400}
                height={160}
                className="w-full h-40 object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  No image available
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
            <div className="absolute bottom-2 left-2 text-white">
              <h3 className="font-semibold text-lg">{category.name}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className="text-gray-600 text-sm line-clamp-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: category.description || "" }}
            />

            {loading ? (
              <div className="space-y-2">
                <div className="bg-gray-200 h-3 rounded animate-pulse"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3 animate-pulse"></div>
              </div>
            ) : (
              <div>
                <p className="text-blue-600 font-medium text-sm mb-2">
                  {products.length > 0
                    ? `${products.length}+ products available`
                    : "View products"}
                </p>
                {products.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Starting from ৳
                    {Math.min(...products.map((p) => p.price)).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <span className="text-blue-600 font-medium text-sm hover:text-blue-700">
                Explore Category →
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
