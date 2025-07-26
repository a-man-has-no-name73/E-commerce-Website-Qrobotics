"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/products/product-grid"
import { SearchFilters } from "@/components/search/search-filters"
import { mockProducts } from "@/lib/mock-data"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState(mockProducts)
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    category: "",
    priceRange: "",
    inStock: false,
  })

  useEffect(() => {
    let filtered = mockProducts

    // Search filter
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm),
      )
    }

    // Apply other filters
    if (filters.category) {
      filtered = filtered.filter((product) => product.category.toLowerCase() === filters.category.toLowerCase())
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((product) => product.price >= min && product.price <= max)
    }

    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock)
    }

    setSearchResults(filtered)
  }, [filters])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: searchParams.get("q") || "",
    }))
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {filters.query ? `Search Results for "${filters.query}"` : "Search Products"}
            </h1>
            <p className="text-gray-600">
              {filters.query
                ? `Found ${searchResults.length} products matching your search.`
                : "Search our complete catalog of workplace automation solutions."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              <ProductGrid products={searchResults} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
