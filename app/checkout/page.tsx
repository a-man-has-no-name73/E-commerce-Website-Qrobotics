"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { useCart } from "@/components/cart/cart-context"
import { useAuth } from "@/components/auth/auth-context"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  if (!user) {
    router.push("/login?redirect=/checkout")
    return null
  }

  const handlePlaceOrder = async (shippingData: any) => {
    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create order (mock)
    const order = {
      id: Date.now(),
      items,
      total: total + (total > 1000 ? 0 : 50),
      shipping: shippingData,
      status: "confirmed",
      date: new Date().toISOString(),
    }

    // Store order in localStorage (mock database)
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]))

    clearCart()
    router.push(`/order-confirmation/${order.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CheckoutForm onSubmit={handlePlaceOrder} isProcessing={isProcessing} />
            <OrderSummary />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
