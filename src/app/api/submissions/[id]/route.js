import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk memperbarui (update) sebuah submission dengan nilai dan feedback
export async function PUT(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id: submissionId } = await params; // Mengambil ID submission dari URL

  try {
    // 1. Memeriksa apakah pengguna yang login adalah 'pengajar'
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // Kita bisa tambahkan validasi peran 'pengajar' di sini jika perlu
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (userProfile?.role !== "pengajar") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    // 2. Mengambil data nilai dan feedback dari body permintaan
    const { nilai, feedback } = await request.json();

    if (nilai === undefined || feedback === undefined) {
      return NextResponse.json(
        { message: "Nilai dan feedback wajib diisi" },
        { status: 400 }
      );
    }

    // 3. Memperbarui data di tabel 'submissions'
    const { data, error } = await supabase
      .from("submissions")
      .update({ nilai, feedback })
      .eq("submission_id", submissionId)
      .select()
      .single();

    if (error) throw error;

    // 4. Mengembalikan respons berhasil
    return NextResponse.json({ message: "Penilaian berhasil disimpan", data });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating submission", error: error.message },
      { status: 500 }
    );
  }
}
