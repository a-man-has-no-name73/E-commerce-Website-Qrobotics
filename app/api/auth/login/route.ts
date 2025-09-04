import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"
import { z } from "zod"
import { cookies } from "next/headers"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const { email, password } = result.data

    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (!user || user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set("qrobotics_user_id", String(user.user_id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax", // Changed from "strict" to "lax"
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set("qrobotics_role", "user", {
      httpOnly: true,
      path: "/",
      sameSite: "lax", // Changed from "strict" to "lax"
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        role: "user",
      },
    })
  } catch (error) {
    console.error("User login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
