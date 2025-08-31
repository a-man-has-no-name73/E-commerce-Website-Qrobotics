import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { cloudinary } from "@/lib/cloudinary";

export async function DELETE(request: NextRequest) {
  try {
    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // First get count of products in this category (for the success message)
    const { data: products, error: productsError } = await supabaseServer
      .from("products")
      .select("product_id")
      .eq("category_id", categoryId);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: "Failed to fetch products in category" },
        { status: 500 }
      );
    }

    const productCount = products?.length || 0;

    // Set category_id to NULL for all products in this category
    // (This prevents orphaned products and maintains data integrity)
    if (productCount > 0) {
      const { error: updateProductsError } = await supabaseServer
        .from("products")
        .update({ category_id: null })
        .eq("category_id", categoryId);

      if (updateProductsError) {
        console.error("Error updating products:", updateProductsError);
        return NextResponse.json(
          { error: "Failed to update products in category" },
          { status: 500 }
        );
      }
    }

    // Get category images to delete from Cloudinary
    const { data: categoryImages, error: categoryImagesError } = await supabaseServer
      .from("category_images")
      .select("cloudinary_public_id")
      .eq("category_id", categoryId);

    if (!categoryImagesError && categoryImages) {
      // Delete category images from Cloudinary
      for (const image of categoryImages) {
        if (image.cloudinary_public_id) {
          try {
            await cloudinary.uploader.destroy(image.cloudinary_public_id);
          } catch (cloudinaryError) {
            console.error("Failed to delete category image from Cloudinary:", cloudinaryError);
          }
        }
      }
    }

    // Delete category images from database
    const { error: deleteCategoryImagesError } = await supabaseServer
      .from("category_images")
      .delete()
      .eq("category_id", categoryId);

    if (deleteCategoryImagesError) {
      console.error("Error deleting category images:", deleteCategoryImagesError);
      return NextResponse.json(
        { error: "Failed to delete category images" },
        { status: 500 }
      );
    }

    // Finally, delete the category
    const { error: categoryError } = await supabaseServer
      .from("categories")
      .delete()
      .eq("category_id", categoryId);

    if (categoryError) {
      console.error("Error deleting category:", categoryError);
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: productCount > 0 
        ? `Category deleted successfully. ${productCount} products have been moved to "No Category" and are still available.`
        : "Category deleted successfully."
    });

  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
