import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk memeriksa apakah siswa sudah pernah submit tugas
export async function GET(request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json(
      { message: "assignmentId diperlukan" },
      { status: 400 }
    );
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("id_assignment", assignmentId)
      .eq("id_siswa", user.id) // Filter berdasarkan siswa yang sedang login
      .maybeSingle(); // Gunakan maybeSingle agar tidak error jika tidak ada data

    if (error) throw error;

    return NextResponse.json({ data: submission });
  } catch (error) {
    return NextResponse.json(
      { message: "Error checking submission", error: error.message },
      { status: 500 }
    );
  }
}
