"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { mockProducts } from "@/lib/mock-data"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || ""
  const searchParam = searchParams.get("search") || ""

  const [filters, setFilters] = useState({
    category: categoryParam,
    priceRange: "",
    inStock: false,
    search: searchParam,
  })
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryParam,
      search: searchParam,
    }))
  }, [categoryParam, searchParam])

  useEffect(() => {
    let filtered = mockProducts

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm),
      )
    }

    // Category filter - fix the mapping
    if (filters.category) {
      const categoryMap = {
        manufacturing: "Manufacturing",
        warehouse: "Warehouse",
        office: "Office",
        healthcare: "Healthcare",
      }
      const mappedCategory = categoryMap[filters.category] || filters.category
      filtered = filtered.filter((product) => product.category === mappedCategory)
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((product) => product.price >= min && product.price <= max)
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock)
    }

    setFilteredProducts(filtered)
  }, [filters])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {filters.search ? `Search Results for "${filters.search}"` : "Products"}
            </h1>
            <p className="text-gray-600">
              {filters.search
                ? `Found ${filteredProducts.length} products matching your search.`
                : "Discover our complete range of workplace robotics solutions and automation systems."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ProductFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
