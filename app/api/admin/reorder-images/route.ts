import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, imageOrder } = body;

    if (!productId || !Array.isArray(imageOrder)) {
      return NextResponse.json(
        { error: "Product ID and image order array are required" },
        { status: 400 }
      );
    }

    // Update each image's serial number and primary status
    const updatePromises = imageOrder.map(async (item: { imageId: number; serialNumber: number }, index) => {
      const isPrimary = index === 0; // First image is always primary
      
      const { error } = await supabaseServer
        .from("productimages")
        .update({
          serial_number: item.serialNumber,
          is_primary: isPrimary
        })
        .eq("image_id", item.imageId)
        .eq("product_id", productId);

      if (error) {
        throw error;
      }
    });

    await Promise.all(updatePromises);

    // Fetch updated images to return
    const { data: updatedImages, error: fetchError } = await supabaseServer
      .from("productimages")
      .select("image_id, image_url, cloudinary_public_id, file_name, is_primary, serial_number, created_at")
      .eq("product_id", productId)
      .order('serial_number', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({
      success: true,
      images: updatedImages?.map((img: any) => ({
        id: img.image_id,
        url: img.image_url,
        publicId: img.cloudinary_public_id,
        fileName: img.file_name,
        isPrimary: img.is_primary,
        serialNumber: img.serial_number,
        createdAt: img.created_at,
      })) || []
    });

  } catch (error) {
    console.error("Error reordering images:", error);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}
