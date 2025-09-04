"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "./cart-context";

export function CartSummary() {
  const { items, total, totalItems, clearCart, loading } = useCart();
  const shipping = total > 1000 ? 0 : 50;
  const finalTotal = total + shipping;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Items ({totalItems})</span>
          <span>৳{total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `৳${shipping}`}</span>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>৳{finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <Link href="/checkout">
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0 || loading}
          >
            Proceed to Checkout
          </Button>
        </Link>

        <div className="flex gap-2">
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={clearCart}
            disabled={items.length === 0 || loading}
            className="text-red-600 hover:text-red-700"
          >
            Clear Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
