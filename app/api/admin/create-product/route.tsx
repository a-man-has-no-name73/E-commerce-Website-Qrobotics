// Create Product
// app/api/admin/create-product/route.ts
import { NextResponse as ProductResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z as productZ } from "zod";
import { cookies as getCookies } from "next/headers";

const productSchema = productZ.object({
  category_id: productZ.number(),
  name: productZ.string().min(1),
  description: productZ.string().optional(),
  price: productZ.number(),
  created_by: productZ.number(),
  images: productZ
    .array(
      productZ.object({
        url: productZ.string(),
        publicId: productZ.string(),
        fileName: productZ.string(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  const cookieStore = await getCookies();
  const role = cookieStore.get("qrobotics_role")?.value;

  if (role !== "admin")
    return ProductResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return ProductResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    category_id,
    name,
    description,
    price,
    created_by,
    images = [],
  } = parsed.data;

  const { data: productData, error: productError } = await supabaseServer
    .from("products")
    .insert([{ category_id, name, description, price, created_by }])
    .select("*")
    .single();

  if (productError) {
    return ProductResponse.json(
      { error: productError.message },
      { status: 500 }
    );
  }

  if (images.length > 0) {
    const imageInserts = images.map((image, index) => ({
      product_id: productData.product_id,
      image_url: image.url,
      cloudinary_public_id: image.publicId,
      file_name: image.fileName,
      is_primary: index === 0, // First image is primary
    }));

    const { data: imageData, error: imageError } = await supabaseServer
      .from("productimages")
      .insert(imageInserts)
      .select("*");

    if (imageError) {
      return ProductResponse.json(
        {
          success: true,
          product: productData,
          warning:
            "Product created but some images failed to upload: " +
            imageError.message,
          imageError: true,
        },
        { status: 200 }
      );
    }

    // Return product with successful images
    return ProductResponse.json({
      success: true,
      product: { ...productData, images: imageData },
    });
  }

  return ProductResponse.json({ success: true, product: productData });
}
