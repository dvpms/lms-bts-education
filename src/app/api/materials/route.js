import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Periksa sesi pengguna
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // 2. Ambil data dari form-data
    const formData = await request.formData();
    const file = formData.get("file");
    const id_course = formData.get("id_course");
    const judul_materi = formData.get("judul_materi");
    const deskripsi = formData.get("deskripsi");

    if (!file || !id_course || !judul_materi) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // 3. Unggah file ke Supabase Storage
    const filePath = `materials/${id_course}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("lms-file") // Ganti 'lms-file' dengan nama bucket Anda
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // 4. Simpan informasi materi ke database
    const { data, error: insertError } = await supabase
      .from("materials")
      .insert([
        {
          id_course,
          judul_materi,
          deskripsi,
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
      { message: "Materi berhasil diunggah", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error uploading material", error: error.message },
      { status: 500 }
    );
  }
}
