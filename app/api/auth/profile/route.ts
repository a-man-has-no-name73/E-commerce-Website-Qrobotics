import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";

const updateProfileSchema = z.object({
  user_id: z.number(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().length(11, "Phone number must be exactly 11 digits").regex(/^\d+$/, "Phone number must contain only digits").optional().or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = updateProfileSchema.safeParse(body);
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

    // Update the user profile
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone_number: validatedData.phone_number || null,
      })
      .eq("user_id", validatedData.user_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: data
    });
    
  } catch (error) {
    console.error("Error in profile update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      .from("users")
      .select("user_id, email, first_name, last_name, phone_number, date_registered")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
    
  } catch (error) {
    console.error("Error in profile fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}