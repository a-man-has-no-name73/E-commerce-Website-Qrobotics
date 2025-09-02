import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  try {
    // Get all products with category information for admin
    const { data: productsData, error: productsError } = await supabaseServer
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
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    // Get images for each product
    const productsWithDetails = await Promise.all(
      (productsData || []).map(async (product) => {
        // Get images
        const { data: imagesData } = await supabaseServer
          .from("productimages")
          .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, serial_number, created_at")
          .eq("product_id", product.product_id)
          .order('serial_number', { ascending: true });

        return {
          product_id: product.product_id, // Keep original field name for admin
          name: product.name,
          description: product.description,
          price: product.price,
          product_code: product.product_code,
          quantity: product.quantity || 0,
          category_id: product.category_id,
          is_available: product.is_available,
          created_at: product.created_at,
          updated_at: product.updated_at,
          category_name: (product.categories as any)?.name || 'Unknown',
          images: (imagesData || []).map((img: any) => ({
            id: img.image_id,
            url: img.image_url,
            publicId: img.cloudinary_public_id,
            fileName: img.file_name,
            isPrimary: img.is_primary,
            serialNumber: img.serial_number,
            createdAt: img.created_at,
          })),
        };
      })
    );

    return NextResponse.json({ 
      products: productsWithDetails,
      total: productsWithDetails.length 
    });
  } catch (error) {
    console.error("Admin products API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
