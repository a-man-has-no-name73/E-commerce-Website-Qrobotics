import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";

const editCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = editCategorySchema.parse(body);

    const supabase = supabaseServer;

    // Update the category
    const { error: categoryError } = await supabase
      .from("categories")
      .update({
        name: validatedData.name,
        description: validatedData.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("category_id", validatedData.id);

    if (categoryError) {
      console.error("Error updating category:", categoryError);
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Category updated successfully" 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in edit category API:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
