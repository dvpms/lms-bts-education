import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua pengumpulan tugas untuk satu assignment
export async function GET(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id: assignmentId } = await params; // Mengambil ID tugas dari URL

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // Mengambil semua data dari tabel 'submissions'
    // dan juga data nama siswa dari tabel 'users' yang terhubung
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        users (
          nama_lengkap
        )
      `
      )
      .eq("id_assignment", assignmentId);

    if (error) throw error;

    return NextResponse.json({ data: submissions });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching submissions", error: error.message },
      { status: 500 }
    );
  }
}
