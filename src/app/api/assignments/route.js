import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua tugas berdasarkan ID kursus
export async function GET(request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { message: "courseId diperlukan" },
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

    const { data: assignments, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("id_course", courseId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: assignments });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching assignments", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk membuat tugas baru (sekarang dengan file)
export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const id_course = formData.get("id_course");
    const judul_tugas = formData.get("judul_tugas");
    const instruksi = formData.get("instruksi");

    if (!file || !id_course || !judul_tugas) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Unggah file soal tugas ke Supabase Storage
    const filePath = `assignments/${id_course}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("lms-file") // Pastikan nama bucket sudah benar
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Simpan informasi tugas (termasuk path file) ke database
    const { data, error: insertError } = await supabase
      .from("assignments")
      .insert([
        {
          id_course,
          judul_tugas,
          instruksi,
          file_path: filePath,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Jika gagal menyimpan ke DB, hapus file yang sudah terunggah
      await supabase.storage.from("lms-file").remove([filePath]);
      throw insertError;
    }

    return NextResponse.json(
      { message: "Tugas berhasil dibuat", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating assignment", error: error.message },
      { status: 500 }
    );
  }
}
