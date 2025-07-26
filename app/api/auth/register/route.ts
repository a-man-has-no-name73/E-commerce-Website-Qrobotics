import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"
import { z } from "zod"
import { cookies } from "next/headers"

// Zod schema for backend protection
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().regex(/^01\d{9}$/, "Phone must start with 01 and be 11 digits"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 })
    }

    const { email, password, firstName, lastName, phoneNumber } = result.data

    // Check if user already exists
    const { data: existingUser } = await supabaseServer
      .from("Users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Insert user directly
    const { data: newUser, error: insertError } = await supabaseServer
      .from("users")
      .insert([
        {
          email,
          password_hash: password, // not hashed
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          is_active: true,
        },
      ])
      .select("*")
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Set authentication cookies after successful registration
    const cookieStore = await cookies()
    cookieStore.set("qrobotics_user_id", String(newUser.user_id), {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set("qrobotics_role", "user", {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      user: {
        id: newUser.user_id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: "user",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
