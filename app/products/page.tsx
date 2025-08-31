"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { useProducts } from "@/hooks/use-products";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const { products, pagination, loading, error } = useProducts({
    category: categoryParam || undefined,
    search: searchParam || undefined,
    page: currentPage,
    limit: productsPerPage,
  });

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [categoryParam, searchParam]);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Products</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading products: {error}</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-1">
                  {/* Previous button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      if (pagination.totalPages <= 7) return true;
                      if (page === 1 || page === pagination.totalPages)
                        return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm border rounded-md ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                  {/* Next button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
