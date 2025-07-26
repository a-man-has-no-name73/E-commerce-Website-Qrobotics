import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const featuredProducts = [
  {
    id: 1,
    name: "QR-Assembly Pro X1",
    price: 24999,
    originalPrice: 29999,
    image: "/placeholder.svg?height=250&width=300",
    category: "Manufacturing",
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "QR-Warehouse Navigator",
    price: 8999,
    image: "/placeholder.svg?height=250&width=300",
    category: "Warehouse",
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: "QR-Office Assistant Pro",
    price: 4999,
    image: "/placeholder.svg?height=250&width=300",
    category: "Office",
    inStock: true,
    featured: true,
  },
  {
    id: 4,
    name: "QR-Lab Analyzer",
    price: 15999,
    image: "/placeholder.svg?height=250&width=300",
    category: "Healthcare",
    inStock: false,
    featured: true,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600">Discover our most popular and innovative robotics solutions.</p>
          </div>
          <Link href="/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
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
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-blue-600">${product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toLocaleString()}
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
    </section>
  )
}
