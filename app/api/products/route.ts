import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const productCodeSearch = searchParams.get('product_code')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build the query
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
        categories (
          category_id,
          name
        )
      `)

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

    // Apply search filter with prioritization
    if (productCodeSearch) {
      // For product code search, prioritize exact matches first, then partial matches
      query = query.or(`product_code.eq.${productCodeSearch},product_code.ilike.%${productCodeSearch}%`)
    } else if (search) {
      // Use a more complex query that prioritizes product_code, then name, then description
      query = query.or(`product_code.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)
    
    // Order by search relevance if search is provided, otherwise by availability and date
    if (search) {
      // We'll sort the results after fetching since Supabase doesn't support complex ordering in this case
      query = query.order('is_available', { ascending: false }).order('created_at', { ascending: false })
    } else {
      query = query.order('is_available', { ascending: false }).order('created_at', { ascending: false })
    }

    // Get total count first with a separate query
    let countQuery = supabaseServer
      .from("products")
      .select("product_id", { count: 'exact', head: true })

    // Apply the same filters for count
    if (category) {
      const { data: categoryData } = await supabaseServer
        .from("categories")
        .select("category_id")
        .or(`name.ilike.%${category}%,category_id.eq.${category}`)
        .single()
      
      if (categoryData) {
        countQuery = countQuery.eq('category_id', categoryData.category_id)
      }
    }

    if (productCodeSearch) {
      countQuery = countQuery.or(`product_code.eq.${productCodeSearch},product_code.ilike.%${productCodeSearch}%`)
    } else if (search) {
      countQuery = countQuery.or(`product_code.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
    }

    const { data: productsData, error: productsError } = await query

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    // Sort products by search relevance if search is provided
    let sortedProducts = productsData || [];
    if ((search || productCodeSearch) && sortedProducts.length > 0) {
      const searchTerm = productCodeSearch || search;
      if (!searchTerm) return NextResponse.json({ products: sortedProducts, pagination: { totalPages: Math.ceil((count || 0) / limit), currentPage: page, totalCount: count || 0 } });
      
      const searchLower = searchTerm.toLowerCase();
      
      sortedProducts = sortedProducts.sort((a, b) => {
        // If we're specifically searching by product code
        if (productCodeSearch) {
          const aExactMatch = a.product_code?.toLowerCase() === searchLower;
          const bExactMatch = b.product_code?.toLowerCase() === searchLower;
          
          // Exact matches first
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // Both exact or both partial - sort by availability, then date
          if (b.is_available !== a.is_available) {
            return b.is_available ? 1 : -1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        // Regular search with priority scoring
        const getScore = (product: any) => {
          let score = 0;
          
          // Check product_code match (highest priority)
          if (product.product_code?.toLowerCase().includes(searchLower)) {
            score += 3;
            // Exact match gets bonus
            if (product.product_code?.toLowerCase() === searchLower) {
              score += 2;
            }
          }
          
          // Check name match (medium priority)
          if (product.name?.toLowerCase().includes(searchLower)) {
            score += 2;
            // Exact match gets bonus
            if (product.name?.toLowerCase() === searchLower) {
              score += 1;
            }
          }
          
          // Check description match (lowest priority)
          if (product.description?.toLowerCase().includes(searchLower)) {
            score += 1;
          }
          
          return score;
        };
        
        const scoreA = getScore(a);
        const scoreB = getScore(b);
        
        // Sort by score descending, then by availability, then by created_at
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        
        // Secondary sort by availability
        if (b.is_available !== a.is_available) {
          return b.is_available ? 1 : -1;
        }
        
        // Tertiary sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    // Get images for each product
    const productsWithImages = await Promise.all(
      sortedProducts.map(async (product) => {
        const { data: imagesData } = await supabaseServer
          .from("productimages")
          .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, created_at")
          .eq("product_id", product.product_id)
          .order('is_primary', { ascending: false })

        return {
          id: product.product_id,
          name: product.name,
          description: product.description,
          price: product.price,
          product_code: product.product_code,
          category: (product.categories as any)?.name || 'Unknown',
          category_id: product.category_id,
          inStock: (product.quantity || 0) > 0,
          stock: product.quantity || 0,
          quantity: product.quantity || 0,
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
