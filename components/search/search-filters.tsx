"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface SearchFiltersProps {
  filters: {
    query: string
    category: string
    priceRange: string
    inStock: boolean
  }
  onFiltersChange: (filters: any) => void
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const categories = [
    { id: "manufacturing", name: "Manufacturing Automation" },
    { id: "warehouse", name: "Warehouse & Logistics" },
    { id: "office", name: "Office Automation" },
    { id: "healthcare", name: "Healthcare & Lab" },
  ]

  const priceRanges = [
    { id: "0-5000", name: "Under $5,000" },
    { id: "5000-15000", name: "$5,000 - $15,000" },
    { id: "15000-30000", name: "$15,000 - $30,000" },
    { id: "30000-100000", name: "$30,000+" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refine Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search products..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all" />
              <Label htmlFor="all">All Categories</Label>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={category.id} />
                <Label htmlFor={category.id}>{category.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value })}
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
              onCheckedChange={(checked) => onFiltersChange({ ...filters, inStock: checked })}
            />
            <Label htmlFor="in-stock">In Stock Only</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
