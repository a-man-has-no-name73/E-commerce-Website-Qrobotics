import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const product_code = searchParams.get('product_code')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build the query for inventory management
    let query = supabaseServer
      .from("products")
      .select(`
        product_id,
        name,
        description,
        price,
        product_code,
        quantity,
        category_id,
        is_available,
        created_at,
        updated_at,
        categories (
          category_id,
          name
        )
      `)

    // Apply category filter
    if (category && category !== 'all') {
      if (isNaN(Number(category))) {
        // Filter by category name
        const { data: categoryData } = await supabaseServer
          .from("categories")
          .select("category_id")
          .ilike('name', `%${category}%`)
          .single()
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.category_id)
        }
      } else {
        // Filter by category ID
        query = query.eq('category_id', parseInt(category))
      }
    }

    // Apply search filter (search in product name and description)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply product code filter
    if (product_code) {
      query = query.ilike('product_code', `%${product_code}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)

    // Order by name for consistent results
    query = query.order('name', { ascending: true })

    const { data: products, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabaseServer
      .from("products")
      .select("*", { count: 'exact', head: true })

    if (category && category !== 'all') {
      if (isNaN(Number(category))) {
        const { data: categoryData } = await supabaseServer
          .from("categories")
          .select("category_id")
          .ilike('name', `%${category}%`)
          .single()
        
        if (categoryData) {
          countQuery = countQuery.eq('category_id', categoryData.category_id)
        }
      } else {
        countQuery = countQuery.eq('category_id', parseInt(category))
      }
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (product_code) {
      countQuery = countQuery.ilike('product_code', `%${product_code}%`)
    }

    const { count } = await countQuery

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, quantity } = body

    if (!product_id || quantity === undefined || quantity < 0) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 })
    }

    // Update product quantity and is_available status
    const { data, error } = await supabaseServer
      .from("products")
      .update({ 
        quantity: quantity,
        is_available: quantity > 0,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', product_id)
      .select(`
        product_id,
        name,
        product_code,
        quantity,
        is_available,
        categories (
          category_id,
          name
        )
      `)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update product quantity" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Product quantity updated successfully",
      product: data
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
