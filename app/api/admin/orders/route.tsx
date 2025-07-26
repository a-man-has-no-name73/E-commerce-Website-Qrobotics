
// Fetch Orders
// app/api/admin/orders/route.ts
import { NextResponse as OrdersResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"
import { cookies as getCookies } from "next/headers"

export async function GET() {
  const cookieStore = await getCookies()
  const role = cookieStore.get("qrobotics_role")?.value
  if (role !== "admin") return OrdersResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { data, error } = await supabaseServer.from("orders").select(`
    order_id,
    user_id,
    order_date,
    total_amount,
    shipping_status,
    payment_status
  `)

  if (error) return OrdersResponse.json({ error: error.message }, { status: 500 })
  return OrdersResponse.json({ orders: data })
}
