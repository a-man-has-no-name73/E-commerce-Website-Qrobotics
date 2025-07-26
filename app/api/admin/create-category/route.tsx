// Create Category
// app/api/admin/create-category/route.ts
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"
import { z } from "zod"
import { cookies as getCookies } from "next/headers"

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parent_category_id: z.number().optional().nullable()
})

export async function POST(req: Request) {
  const cookieStore = await getCookies()
  const role = cookieStore.get("qrobotics_role")?.value
  if (role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description, parent_category_id } = parsed.data

  const { data, error } = await supabaseServer.from("categories").insert([
    { name, description, parent_category_id: parent_category_id || null }
  ]).select("*").single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, category: data })
}
