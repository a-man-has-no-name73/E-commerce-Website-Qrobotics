import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { cookies } from "next/headers";
import { z } from "zod";

const deleteCategoryImageSchema = z.object({
  imageId: z.number(),
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
      .from("category_images")
      .select("cloudinary_public_id, category_id")
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
        const deleteResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/delete-image`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId: imageData.cloudinary_public_id }),
        });
        
        cloudinaryResult = await deleteResponse.json();
        
        if (!deleteResponse.ok) {
          console.error("Failed to delete from Cloudinary:", cloudinaryResult.message);
          // Continue with database deletion even if Cloudinary fails
        }
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseServer
      .from("category_images")
      .delete()
      .eq("image_id", imageId);

    if (deleteError) {
      console.error("Error deleting from database:", deleteError);
      return NextResponse.json(
        { message: "Failed to delete image from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      cloudinaryResult,
    });

  } catch (error) {
    console.error("Error in delete category image API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
