import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteImageFromCloudinary(publicId: string) {
  try {
    if (!publicId) {
      throw new Error("Public ID is required");
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return {
        success: true,
        message: "Image deleted successfully",
        result: result.result,
      };
    } else {
      return {
        success: false,
        message: `Failed to delete image: ${result.result}`,
        result: result.result,
      };
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete image",
      error,
    };
  }
}

export { cloudinary };
