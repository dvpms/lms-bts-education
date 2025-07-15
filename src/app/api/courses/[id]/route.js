import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil satu kursus berdasarkan ID
export async function GET(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = params; // Mengambil ID dari URL

  try {
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("course_id", id)
      .single();

    if (error) throw error;
    if (!course) {
      //
      return NextResponse.json(
        { message: "Kursus tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: course });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching course", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk memperbarui (update) satu kursus berdasarkan ID
export async function PUT(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { nama_course, deskripsi } = await request.json();
    const { data, error } = await supabase
      .from("courses")
      .update({ nama_course, deskripsi })
      .eq("course_id", id)
      .eq("id_pengajar", user.id); // Keamanan: Pastikan hanya pemilik yang bisa mengedit

    if (error) throw error;

    return NextResponse.json({ message: "Kursus berhasil diperbarui." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating course", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menghapus satu kursus berdasarkan ID
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

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("course_id", id)
      .eq("id_pengajar", user.id); // Keamanan: Pastikan hanya pemilik yang bisa menghapus

    if (error) throw error;

    return NextResponse.json({ message: "Kursus berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting course", error: error.message },
      { status: 500 }
    );
  }
}
