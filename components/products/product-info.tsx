"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/cart-context"

interface ProductInfoProps {
  product: {
    id: number
    name: string
    price: number
    originalPrice?: number
    category: string
    inStock: boolean
    description: string
    specifications?: Record<string, string>
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: "/placeholder.svg?height=100&width=100",
      quantity,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-blue-600">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xl text-gray-500 line-through">${product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          {product.inStock ? (
            <Badge className="bg-green-100 text-green-800">In Stock</Badge>
          ) : (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {product.specifications && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <dl className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-gray-600">{key}:</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {product.inStock && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  )
}
