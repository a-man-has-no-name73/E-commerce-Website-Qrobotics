import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { cloudinary } from "@/lib/cloudinary";

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // First get all product images to delete from Cloudinary
    const { data: images, error: imagesError } = await supabaseServer
      .from("productimages")
      .select("cloudinary_public_id")
      .eq("product_id", productId);

    if (imagesError) {
      console.error("Error fetching product images:", imagesError);
      return NextResponse.json(
        { error: "Failed to fetch product images" },
        { status: 500 }
      );
    }

    // Delete images from Cloudinary
    if (images && images.length > 0) {
      for (const image of images) {
        if (image.cloudinary_public_id) {
          try {
            await cloudinary.uploader.destroy(image.cloudinary_public_id);
          } catch (cloudinaryError) {
            console.error("Failed to delete image from Cloudinary:", cloudinaryError);
            // Continue with database deletion even if Cloudinary fails
          }
        }
      }
    }

    // Delete product images from database
    const { error: deleteImagesError } = await supabaseServer
      .from("productimages")
      .delete()
      .eq("product_id", productId);

    if (deleteImagesError) {
      console.error("Error deleting product images:", deleteImagesError);
      return NextResponse.json(
        { error: "Failed to delete product images" },
        { status: 500 }
      );
    }

    // Delete inventory records
    const { error: inventoryError } = await supabaseServer
      .from("productinventory")
      .delete()
      .eq("product_id", productId);

    if (inventoryError) {
      console.error("Error deleting inventory:", inventoryError);
      return NextResponse.json(
        { error: "Failed to delete inventory" },
        { status: 500 }
      );
    }

    // Delete the product
    const { error: productError } = await supabaseServer
      .from("products")
      .delete()
      .eq("product_id", productId);

    if (productError) {
      console.error("Error deleting product:", productError);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Product and all associated data deleted successfully" 
    });

  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
