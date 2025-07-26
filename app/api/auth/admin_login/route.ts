import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { z } from "zod";
import { cookies } from "next/headers";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const { data: admin } = await supabaseServer
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!admin || admin.password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("qrobotics_user_id", String(admin.admin_id), {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("qrobotics_role", "admin", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("Admin login successful:");

    return NextResponse.json({
      user: {
        id: admin.admin_id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: "admin",
        adminRole: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
