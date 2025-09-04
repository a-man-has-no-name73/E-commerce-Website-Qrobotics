"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./cart-context";

export function CartItems() {
  const { items, updateQuantity, removeItem, loading } = useCart();

  if (loading) {
    return <div className="text-center py-4">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Your cart is empty</div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.product_id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                {item.product_code && (
                  <p className="text-sm text-gray-600">
                    Code: {item.product_code}
                  </p>
                )}
                <p className="text-blue-600 font-medium">
                  ৳{item.price.toLocaleString()}
                </p>
                {item.is_available === false && (
                  <p className="text-red-600 text-sm">Out of stock</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={loading}
                  onClick={() =>
                    updateQuantity(item.product_id, item.quantity - 1)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={loading}
                  onClick={() =>
                    updateQuantity(item.product_id, item.quantity + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
