import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
  description: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">{products.length} products found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {product.originalPrice && <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>}
                {!product.inStock && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="p-4">
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-blue-600">৳{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <Link href={`/products/${product.id}`}>
                  <Button className="w-full" disabled={!product.inStock}>
                    {product.inStock ? "View Details" : "Out of Stock"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
