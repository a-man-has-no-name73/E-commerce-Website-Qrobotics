"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";

interface ProductInfoProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    category_id: number;
    product_code?: string;
    inStock: boolean;
    stock: number;
    quantity: number;
    isAvailable: boolean;
    createdAt: string;
    images: Array<{
      id: number;
      url: string;
      publicId: string;
      fileName: string;
      isPrimary: boolean;
      createdAt: string;
    }>;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    console.log("handleAddToCart called");
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || "/placeholder.svg",
      quantity,
      product_code: product.product_code,
      description: product.description,
      is_available: product.isAvailable,
    });
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        {product.product_code && (
          <div className="mb-3">
            <span className="text-sm text-gray-600">
              Product Code:{" "}
              <span className="font-mono font-medium">
                {product.product_code}
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl font-bold text-blue-600">
            ৳{product.price.toLocaleString()}
          </span>
        </div>

        <div className="mb-4">
          <span
            className={`text-lg font-medium ${
              product.inStock ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.inStock ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <div
          className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />
      </div>

      {product.inStock && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ৳{(product.price * quantity).toLocaleString()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
