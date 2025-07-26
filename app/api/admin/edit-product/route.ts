import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";

const editProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category_id: z.number().positive("Category is required"),
  images: z.array(z.object({
    image_url: z.string(),
    cloudinary_public_id: z.string(),
    file_name: z.string(),
    is_primary: z.boolean().optional().default(false),
  })).optional(),
  deletedImageIds: z.array(z.number()).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = editProductSchema.parse(body);

    const supabase = supabaseServer;

    // Start a transaction-like approach
    // First, update the product
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category_id: validatedData.category_id,
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", validatedData.id);

    if (productError) {
      console.error("Error updating product:", productError);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    // Delete specified images if any
    if (validatedData.deletedImageIds && validatedData.deletedImageIds.length > 0) {
      // First, get the cloudinary public IDs for the images to delete
      const { data: imagesToDelete, error: fetchError } = await supabase
        .from("productimages")
        .select("image_id, cloudinary_public_id")
        .in("image_id", validatedData.deletedImageIds);

      if (fetchError) {
        console.error("Error fetching images to delete:", fetchError);
      } else if (imagesToDelete) {
        // Delete from Cloudinary first
        for (const image of imagesToDelete) {
          try {
            await fetch("/api/delete-image", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ publicId: image.cloudinary_public_id }),
            });
          } catch (cloudinaryError) {
            console.error("Error deleting from Cloudinary:", cloudinaryError);
            // Continue even if Cloudinary deletion fails
          }
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("productimages")
        .delete()
        .in("image_id", validatedData.deletedImageIds);

      if (deleteError) {
        console.error("Error deleting images from database:", deleteError);
        // Continue with the process, log the error but don't fail the entire update
      }
    }

    // Add new images if any
    if (validatedData.images && validatedData.images.length > 0) {
      const imagesToInsert = validatedData.images.map((image) => ({
        product_id: validatedData.id,
        image_url: image.image_url,
        cloudinary_public_id: image.cloudinary_public_id,
        file_name: image.file_name,
        is_primary: image.is_primary || false,
      }));

      const { error: imageError } = await supabase
        .from("productimages")
        .insert(imagesToInsert);

      if (imageError) {
        console.error("Error inserting new images:", imageError);
        return NextResponse.json(
          { 
            success: true, 
            message: "Product updated successfully, but some images failed to save",
            partialSuccess: true 
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in edit product API:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
