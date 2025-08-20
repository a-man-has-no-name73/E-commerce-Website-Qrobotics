import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    // Get product with category information
    const { data: productData, error: productError } = await supabaseServer
      .from("products")
      .select(`
        product_id,
        name,
        description,
        price,
        category_id,
        is_available,
        created_at,
        categories (
          category_id,
          name,
          description
        )
      `)
      .eq('product_id', productId)
      .eq('is_available', true) // Only show available products for customers
      .single()

    if (productError || !productData) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get product images
    const { data: imagesData } = await supabaseServer
      .from("productimages")
      .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, created_at")
      .eq("product_id", productId)
      .order('is_primary', { ascending: false })

    // Get inventory
    const { data: inventoryData } = await supabaseServer
      .from("productinventory")
      .select("quantity")
      .eq("product_id", productId)
      .single()

    const product = {
      id: productData.product_id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: (productData.categories as any)?.name || 'Unknown',
      category_id: productData.category_id,
      inStock: (inventoryData?.quantity || 0) > 0,
      stock: inventoryData?.quantity || 0,
      isAvailable: productData.is_available,
      createdAt: productData.created_at,
      images: (imagesData || []).map((img: any) => ({
        id: img.image_id,
        url: img.image_url,
        publicId: img.cloudinary_public_id,
        fileName: img.file_name,
        isPrimary: img.is_primary,
        createdAt: img.created_at,
      })),
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product detail API error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
