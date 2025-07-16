import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { data: assignment, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("assignment_id", id)
      .single();

    if (error) throw error;
    if (!assignment) {
      return NextResponse.json(
        { message: "Tugas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: assignment });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching assignment", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk memperbarui (update) satu tugas berdasarkan ID
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

    const { judul_tugas, instruksi } = await request.json();
    const { data, error } = await supabase
      .from("assignments")
      .update({ judul_tugas, instruksi })
      .eq("assignment_id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Tugas berhasil diperbarui." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating assignment", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menghapus satu tugas berdasarkan ID
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
      .from("assignments")
      .delete()
      .eq("assignment_id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Tugas berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting assignment", error: error.message },
      { status: 500 }
    );
  }
}
