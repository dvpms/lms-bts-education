import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua materi untuk satu kursus spesifik
// URL: GET /api/courses/[id]/materials
export async function GET(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id: courseId } = await params; // Mengambil ID kursus dari URL

  try {
    // Memeriksa apakah pengguna sudah login
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // Mengambil semua materi yang 'id_course'-nya cocok
    const { data: materials, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id_course", courseId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: materials });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching materials", error: error.message },
      { status: 500 }
    );
  }
}
