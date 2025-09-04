// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function GET() {
  const cookieStore = await getCookies();
  const userId = cookieStore.get("qrobotics_user_id")?.value;
  const role = cookieStore.get("qrobotics_role")?.value;

  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized", user: null },
      { status: 401 }
    );
  }

  try {
    let user;

    if (role === "admin") {
      // Get admin data from admins table
      const { data: adminData, error } = await supabaseServer
        .from("admins")
        .select("admin_id, email, first_name, last_name, role")
        .eq("admin_id", parseInt(userId))
        .single();

      if (error || !adminData) {
        return NextResponse.json(
          { error: "Admin not found", user: null },
          { status: 404 }
        );
      }

      user = {
        id: adminData.admin_id,
        email: adminData.email,
        firstName: adminData.first_name,
        lastName: adminData.last_name,
        role: "admin",
        adminRole: adminData.role,
      };
    } else {
      // Get user data from users table
      const { data: userData, error } = await supabaseServer
        .from("users")
        .select("user_id, email, first_name, last_name, phone_number")
        .eq("user_id", parseInt(userId))
        .single();

      if (error || !userData) {
        return NextResponse.json(
          { error: "User not found", user: null },
          { status: 404 }
        );
      }

      user = {
        id: userData.user_id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        role: "user", // Set role to "user" since it's from users table
      };
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error", user: null },
      { status: 500 }
    );
  }
}
