import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const orders = await db.getOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    const order = await db.createOrder({
      user_id: Number.parseInt(orderData.user_id),
      total_amount: Number.parseFloat(orderData.total_amount),
      shipping_address_id: Number.parseInt(orderData.shipping_address_id),
      billing_address_id: Number.parseInt(orderData.billing_address_id),
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_status || "pending",
      shipping_status: orderData.shipping_status || "processing",
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
