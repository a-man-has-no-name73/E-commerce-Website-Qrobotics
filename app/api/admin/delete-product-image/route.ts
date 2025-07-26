import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { cookies } from "next/headers";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("qrobotics_role")?.value;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 }
      );
    }

    // First, get the image data from database
    const { data: imageData, error: fetchError } = await supabaseServer
      .from("productimages")
      .select("cloudinary_public_id, product_id")
      .eq("image_id", imageId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { message: "Image not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    let cloudinaryResult = null;
    if (imageData.cloudinary_public_id) {
      try {
        cloudinaryResult = await cloudinary.uploader.destroy(imageData.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseServer
      .from("productimages")
      .delete()
      .eq("image_id", imageId);

    if (deleteError) {
      return NextResponse.json(
        { message: "Failed to delete image from database", error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Image deleted successfully",
      cloudinaryResult: cloudinaryResult?.result,
      productId: imageData.product_id,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { 
        message: "Delete failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
