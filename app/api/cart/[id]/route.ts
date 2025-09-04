import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { quantity, user_id } = body;
    const productId = params.id; // This is actually product_id since we're using composite key

    if (!user_id || !productId) {
      return NextResponse.json({ 
        error: "User ID and Product ID are required" 
      }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "Quantity must be greater than 0" 
      }, { status: 400 });
    }

    // Update the cart item quantity
    const { data: updatedItem, error } = await supabaseServer
      .from("cartitems")
      .update({ 
        quantity,
        last_updated: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('user_id', user_id) // Ensure user can only update their own items
      .select()
      .single();

    if (error) {
      console.error("Error updating cart item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedItem) {
      return NextResponse.json({ 
        error: "Cart item not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Cart item updated successfully",
      cart_item: updatedItem
    });

  } catch (error) {
    console.error("Cart item PUT API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const productId = params.id; // This is actually product_id since we're using composite key

    if (!userId || !productId) {
      return NextResponse.json({ 
        error: "User ID and Product ID are required" 
      }, { status: 400 });
    }

    // Delete the cart item
    const { data: deletedItem, error } = await supabaseServer
      .from("cartitems")
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId) // Ensure user can only delete their own items
      .select()
      .single();

    if (error) {
      console.error("Error deleting cart item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!deletedItem) {
      return NextResponse.json({ 
        error: "Cart item not found or access denied" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Cart item removed successfully"
    });

  } catch (error) {
    console.error("Cart item DELETE API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
