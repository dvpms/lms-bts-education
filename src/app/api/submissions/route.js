import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk menangani siswa yang mengunggah file jawaban (submission)
export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Memeriksa sesi pengguna (harus seorang 'siswa')
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // Ambil data dari form-data
    const formData = await request.formData();
    const file = formData.get("file");
    const id_assignment = formData.get("id_assignment");

    // id_siswa diambil dari pengguna yang sedang login
    const id_siswa = user.id;

    if (!file || !id_assignment) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 2. Unggah file jawaban ke Supabase Storage
    const filePath = `submissions/${id_assignment}/${id_siswa}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("lms-file") // Pastikan nama bucket sudah benar
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // 3. Simpan informasi pengumpulan tugas ke database
    const { data, error: insertError } = await supabase
      .from("submissions")
      .insert([
        {
          id_assignment,
          id_siswa,
          file_path: filePath,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Jika gagal menyimpan ke DB, hapus file yang sudah terunggah
      await supabase.storage.from("lms-files").remove([filePath]);
      throw insertError;
    }

    return NextResponse.json(
      { message: "Tugas berhasil dikumpulkan", data },
      { status: 201 }
    );
  } catch (error) {
    // Menangani error jika siswa mencoba submit dua kali
    if (error.code === "23505") {
      // Kode error untuk pelanggaran unique
      return NextResponse.json(
        { message: "Anda sudah pernah mengumpulkan tugas ini." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Error submitting assignment", error: error.message },
      { status: 500 }
    );
  }
}
