import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";

const createAddressSchema = z.object({
  user_id: z.number(),
  address_type: z.enum(["billing", "shipping"]),
  street_address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  is_default: z.boolean().default(false),
});

// GET - Fetch user addresses
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from("useraddresses")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses: data });
    
  } catch (error) {
    console.error("Error in addresses fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = createAddressSchema.safeParse(body);
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

    // Insert the new address - trigger will handle default logic automatically
    const { data, error } = await supabase
      .from("useraddresses")
      .insert([{
        user_id: validatedData.user_id,
        address_type: validatedData.address_type,
        street_address: validatedData.street_address,
        city: validatedData.city,
        postal_code: validatedData.postal_code,
        is_default: validatedData.is_default,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating address:", error);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Address created successfully",
      address: data
    });
    
  } catch (error) {
    console.error("Error in address creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}