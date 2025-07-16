import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua submission milik siswa yang sedang login
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

    // 2. Mengambil semua data dari tabel 'submissions'
    //    dan juga data judul tugas & nama kursus dari tabel yang terhubung
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        assignments (
          judul_tugas,
          courses (
            nama_course
          )
        )
      `
      )
      .eq("id_siswa", user.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: submissions });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching submissions", error: error.message },
      { status: 500 }
    );
  }
}
