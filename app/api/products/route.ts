import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"

export async function GET() {
  try {
    const { data: productsData, error: productsError } = await supabaseServer
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
          name
        )
      `)
      .order('created_at', { ascending: false }); // Newest first

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }

    const productsWithImages = await Promise.all(
      (productsData || []).map(async (product) => {
        const { data: imagesData, error: imagesError } = await supabaseServer
          .from("productimages")
          .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, created_at")
          .eq("product_id", product.product_id);

        return {
          ...product,
          category_name: (product.categories as any)?.name,
          images: (imagesData || []).map((img: any) => ({
            id: img.image_id,
            url: img.image_url,
            publicId: img.cloudinary_public_id,
            fileName: img.file_name,
            isPrimary: img.is_primary,
            createdAt: img.created_at,
          })),
        };
      })
    );

    return NextResponse.json({ products: productsWithImages })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
