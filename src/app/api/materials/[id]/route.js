import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk memperbarui (update) data materi (hanya teks, bukan file)
export async function PUT(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { judul_materi, deskripsi } = await request.json();
    const { data, error } = await supabase
      .from("materials")
      .update({ judul_materi, deskripsi })
      .eq("material_id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Materi berhasil diperbarui." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating material", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menghapus materi
export async function DELETE(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // 1. Ambil path file dari database sebelum dihapus
    const { data: material, error: findError } = await supabase
      .from("materials")
      .select("file_path")
      .eq("material_id", id)
      .single();

    if (findError) throw findError;

    // 2. Hapus file dari Supabase Storage
    if (material.file_path) {
      const { error: storageError } = await supabase.storage
        .from("lms-files")
        .remove([material.file_path]);

      if (storageError) throw storageError;
    }

    // 3. Hapus data dari tabel database
    const { error: deleteError } = await supabase
      .from("materials")
      .delete()
      .eq("material_id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Materi berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting material", error: error.message },
      { status: 500 }
    );
  }
}
