import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer;

    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (productsError) {
      console.error("Error fetching products count:", productsError);
    }

    // Get total orders count
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (ordersError) {
      console.error("Error fetching orders count:", ordersError);
    }

    // Get recent orders (last 5 orders)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select(`
        order_id,
        user_id,
        total_amount,
        shipping_status,
        payment_status,
        order_date
      `)
      .order("order_date", { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.error("Error fetching recent orders:", recentOrdersError);
    }

    // Get user information for the orders
    let ordersWithUsers: any[] = [];
    if (recentOrders && recentOrders.length > 0) {
      const userIds = recentOrders.map(order => order.user_id);
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIds);

      if (usersError) {
        console.error("Error fetching users:", usersError);
      }

      // Combine orders with user data
      ordersWithUsers = recentOrders.map((order: any) => {
        const user = users?.find(u => u.user_id === order.user_id);
        return {
          id: order.order_id,
          customer: user ? `${user.first_name} ${user.last_name}` : "Unknown Customer",
          email: user?.email || "",
          total: order.total_amount,
          status: order.shipping_status || order.payment_status || "pending",
          date: new Date(order.order_date).toLocaleDateString("en-US"),
        };
      });
    }

    // Format the data
    const stats = {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      recentOrders: ordersWithUsers
    };

    return NextResponse.json(
      { success: true, stats },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
