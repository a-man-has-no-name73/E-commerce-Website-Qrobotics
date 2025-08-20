"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { SearchFilters } from "@/components/search/search-filters";
import { useProducts } from "@/hooks/use-products";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    category: "",
    priceRange: "",
    inStock: false,
  });

  const { products, loading, error } = useProducts({
    search: filters.query,
    category: filters.category || undefined,
    available: true,
  });

  // Filter products locally for price range and stock status
  const filteredProducts = products.filter((product) => {
    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      if (max && (product.price < min || product.price > max)) return false;
      if (!max && product.price < min) return false;
    }

    // Stock filter
    if (filters.inStock && !product.inStock) return false;

    return true;
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get("q") || "",
    }));
  }, [searchParams]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get("q") || "",
    }));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {filters.query
                ? `Search Results for "${filters.query}"`
                : "Search Products"}
            </h1>
            <p className="text-gray-600">
              {loading
                ? "Searching..."
                : error
                ? "Error loading search results"
                : filters.query
                ? `Found ${filteredProducts.length} products matching your search.`
                : "Search our complete catalog of workplace automation solutions."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                      <div className="bg-gray-300 h-4 rounded mb-2"></div>
                      <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">
                    Error loading products: {error}
                  </p>
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
