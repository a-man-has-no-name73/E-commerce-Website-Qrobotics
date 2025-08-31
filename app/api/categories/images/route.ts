import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/categories/images?categoryId=1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const { data: images, error } = await supabaseServer
      .from("category_images")
      .select("*")
      .eq("category_id", parseInt(categoryId))
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch category images" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected interface
    const transformedImages = (images || []).map((img: any) => ({
      id: img.image_id,
      url: img.image_url,
      publicId: img.cloudinary_public_id,
      fileName: img.file_name,
      isPrimary: img.is_primary,
      createdAt: img.created_at,
    }));

    return NextResponse.json({ images: transformedImages });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories/images - Add images to category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, images } = body;

    if (!categoryId || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Category ID and images array are required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const { data: category, error: categoryError } = await supabaseServer
      .from("categories")
      .select("category_id")
      .eq("category_id", categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get existing images count to determine primary image
    const { data: existingImages, error: existingError } = await supabaseServer
      .from("category_images")
      .select("image_id")
      .eq("category_id", categoryId);

    if (existingError) {
      console.error("Error checking existing images:", existingError);
      return NextResponse.json(
        { error: "Failed to check existing images" },
        { status: 500 }
      );
    }

    const hasExistingImages = existingImages && existingImages.length > 0;

    // Prepare image data for insertion
    const imageData = images.map((img: any, index: number) => ({
      category_id: categoryId,
      image_url: img.url,
      cloudinary_public_id: img.publicId,
      file_name: img.fileName,
      is_primary: !hasExistingImages && index === 0, // First image is primary if no existing images
    }));

    const { data: insertedImages, error: insertError } = await supabaseServer
      .from("category_images")
      .insert(imageData)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save category images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: insertedImages,
      message: `${images.length} image(s) added successfully`,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/images - Delete category image
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, publicId } = body;

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Get image details before deletion
    const { data: imageData, error: fetchError } = await supabaseServer
      .from("category_images")
      .select("*")
      .eq("image_id", imageId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: deleteError } = await supabaseServer
      .from("category_images")
      .delete()
      .eq("image_id", imageId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete image from database" },
        { status: 500 }
      );
    }

    // Delete from Cloudinary if publicId is provided
    if (publicId || imageData.cloudinary_public_id) {
      try {
        const cloudinaryPublicId = publicId || imageData.cloudinary_public_id;
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
        
        if (result.result !== "ok") {
          console.error("Failed to delete from Cloudinary:", result);
          // Don't fail the whole operation if Cloudinary deletion fails
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Don't fail the whole operation
      }
    }

    // If deleted image was primary, make the first remaining image primary
    if (imageData.is_primary) {
      const { data: remainingImages, error: remainingError } = await supabaseServer
        .from("category_images")
        .select("image_id")
        .eq("category_id", imageData.category_id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!remainingError && remainingImages && remainingImages.length > 0) {
        await supabaseServer
          .from("category_images")
          .update({ is_primary: true })
          .eq("image_id", remainingImages[0].image_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
