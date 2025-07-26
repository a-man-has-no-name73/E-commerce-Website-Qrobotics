// GET all categories
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServerClient"

export async function GET() {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("category_id, name, description, created_at")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ categories: data })
}
