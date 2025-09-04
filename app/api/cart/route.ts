import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch cart items with product details
    const { data: cartItems, error } = await supabaseServer
      .from("cartitems")
      .select(`
        user_id,
        product_id,
        quantity,
        added_at,
        last_updated,
        products (
          product_id,
          name,
          description,
          price,
          product_code,
          is_available
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error("Error fetching cart items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get primary images for each product
    const cartItemsWithImages = await Promise.all(
      (cartItems || []).map(async (item: any) => {
        const { data: imageData } = await supabaseServer
          .from("productimages")
          .select("image_url")
          .eq("product_id", item.products.product_id)
          .eq("is_primary", true)
          .single();

        return {
          user_id: item.user_id,
          product_id: item.products.product_id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          product_code: item.products.product_code,
          is_available: item.products.is_available,
          quantity: item.quantity,
          image: imageData?.image_url || '/placeholder.jpg',
          added_at: item.added_at,
          last_updated: item.last_updated
        };
      })
    );

    return NextResponse.json({ 
      cart_items: cartItemsWithImages,
      total_items: cartItemsWithImages.reduce((sum, item) => sum + item.quantity, 0),
      total_price: cartItemsWithImages.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });

  } catch (error) {
    console.error("Cart GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, product_id, quantity = 1 } = body;

    if (!user_id || !product_id) {
      return NextResponse.json({ 
        error: "User ID and Product ID are required" 
      }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ 
        error: "Quantity must be greater than 0" 
      }, { status: 400 });
    }

    // Check if product exists and is available
    const { data: product, error: productError } = await supabaseServer
      .from("products")
      .select("product_id, name, price, is_available, quantity")
      .eq('product_id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.is_available) {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 });
    }

    if (product.quantity < quantity) {
      return NextResponse.json({ 
        error: `Only ${product.quantity} items in stock` 
      }, { status: 400 });
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabaseServer
      .from("cartitems")
      .select("quantity")
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    let result;
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return NextResponse.json({ 
          error: `Cannot add ${quantity} more items. Only ${product.quantity - existingItem.quantity} more available` 
        }, { status: 400 });
      }

      const { data: updatedItem, error: updateError } = await supabaseServer
        .from("cartitems")
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('product_id', product_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      result = updatedItem;
    } else {
      // Insert new item
      const { data: newItem, error: insertError } = await supabaseServer
        .from("cartitems")
        .insert({
          user_id,
          product_id,
          quantity
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      result = newItem;
    }

    return NextResponse.json({ 
      message: "Item added to cart successfully",
      cart_item: result
    }, { status: 201 });

  } catch (error) {
    console.error("Cart POST API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
