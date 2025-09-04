import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";

const updateAddressSchema = z.object({
  address_type: z.enum(["billing", "shipping"]),
  street_address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  is_default: z.boolean().default(false),
  user_id: z.number(),
});

// PUT - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const addressId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const result = updateAddressSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: result.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        },
        { status: 400 }
      );
    }
    
    const validatedData = result.data;
    const supabase = supabaseServer;

    // Update the address - trigger will handle default logic automatically
    const { data, error } = await supabase
      .from("useraddresses")
      .update({
        address_type: validatedData.address_type,
        street_address: validatedData.street_address,
        city: validatedData.city,
        postal_code: validatedData.postal_code,
        is_default: validatedData.is_default,
      })
      .eq("address_id", addressId)
      .eq("user_id", validatedData.user_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating address:", error);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Address updated successfully",
      address: data
    });
    
  } catch (error) {
    console.error("Error in address update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const addressId = parseInt(resolvedParams.id);
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Soft delete the address
    const { error } = await supabase
      .from("useraddresses")
      .update({ deleted_at: new Date().toISOString() })
      .eq("address_id", addressId)
      .eq("user_id", parseInt(userId));

    if (error) {
      console.error("Error deleting address:", error);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Address deleted successfully"
    });
    
  } catch (error) {
    console.error("Error in address deletion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}