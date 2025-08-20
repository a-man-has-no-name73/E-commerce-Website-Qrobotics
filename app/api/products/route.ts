import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const isAvailable = searchParams.get('available') === 'true' ? true : searchParams.get('available') === 'false' ? false : undefined

    // Build the query
    let query = supabaseServer
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
          name
        )
      `)
      .eq('is_available', true) // Only show available products for customers

    // Apply category filter
    if (category) {
      // First get category ID by name or slug
      const { data: categoryData } = await supabaseServer
        .from("categories")
        .select("category_id")
        .or(`name.ilike.%${category}%,category_id.eq.${category}`)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.category_id)
      }
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: productsData, error: productsError, count } = await query

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    // Get images for each product
    const productsWithImages = await Promise.all(
      (productsData || []).map(async (product) => {
        const { data: imagesData } = await supabaseServer
          .from("productimages")
          .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, created_at")
          .eq("product_id", product.product_id)
          .order('is_primary', { ascending: false })

        // Get inventory
        const { data: inventoryData } = await supabaseServer
          .from("productinventory")
          .select("quantity")
          .eq("product_id", product.product_id)
          .single()

        return {
          id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: (product.categories as any)?.name || 'Unknown',
          category_id: product.category_id,
          inStock: (inventoryData?.quantity || 0) > 0,
          stock: inventoryData?.quantity || 0,
          isAvailable: product.is_available,
          createdAt: product.created_at,
          images: (imagesData || []).map((img: any) => ({
            id: img.image_id,
            url: img.image_url,
            publicId: img.cloudinary_public_id,
            fileName: img.file_name,
            isPrimary: img.is_primary,
            createdAt: img.created_at,
          })),
          image: imagesData?.[0]?.image_url || '/placeholder.svg',
        };
      })
    );

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({ 
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
