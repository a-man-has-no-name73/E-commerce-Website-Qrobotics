import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = Number.parseInt(params.productId)
    const { quantity, updated_by } = await request.json()

    const inventory = await db.updateInventory(productId, Number.parseInt(quantity), Number.parseInt(updated_by))

    if (!inventory) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ inventory })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
