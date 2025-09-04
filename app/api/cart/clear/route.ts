import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

// DELETE - Clear all cart items for a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete all cart items for the user
    const { data: deletedItems, error } = await supabaseServer
      .from("cartitems")
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error("Error clearing cart:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Cart cleared successfully",
      items_removed: deletedItems?.length || 0
    });

  } catch (error) {
    console.error("Cart clear API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
