import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua kursus di mana seorang siswa terdaftar
export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Memeriksa sesi pengguna
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // 2. Mengambil semua data pendaftaran (enrollments) untuk siswa yang sedang login
    //    dan juga mengambil seluruh data kursus yang terhubung.
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(
        `
        *,
        courses (
          *
        )
      `
      )
      .eq("id_siswa", user.id);

    if (error) throw error;

    return NextResponse.json({ data: enrollments });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching enrolled courses", error: error.message },
      { status: 500 }
    );
  }
}
