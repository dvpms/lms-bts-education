import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH: Update progress record (by record_id)
export async function PATCH(request) {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }
    const { record_id, note, record_date } = await request.json();
    if (!record_id) {
      return NextResponse.json({ message: "record_id wajib diisi" }, { status: 400 });
    }
    const updateFields = {};
    if (note !== undefined) updateFields.note = note;
    if (record_date !== undefined) updateFields.record_date = record_date;
    const { data, error } = await supabase
      .from("progress_records")
      .update(updateFields)
      .eq("record_id", record_id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ message: "Catatan progres berhasil diupdate", data });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating progress record", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete progress record (by record_id)
export async function DELETE(request) {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }
    const { record_id } = await request.json();
    if (!record_id) {
      return NextResponse.json({ message: "record_id wajib diisi" }, { status: 400 });
    }
    const { error } = await supabase
      .from("progress_records")
      .delete()
      .eq("record_id", record_id);
    if (error) throw error;
    return NextResponse.json({ message: "Catatan progres berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting progress record", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk mengambil semua catatan progres
export async function GET(request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get("enrollmentId");

  if (!enrollmentId) {
    return NextResponse.json(
      { message: "enrollmentId diperlukan" },
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

    const { data: records, error } = await supabase
      .from("progress_records")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching progress records", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menambah catatan progres baru
export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { enrollment_id, note } = await request.json();

    if (!enrollment_id || !note) {
      return NextResponse.json(
        { message: "ID Pendaftaran dan Catatan wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("progress_records")
      .insert([{ enrollment_id, note }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: "Catatan progres berhasil disimpan", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating progress record", error: error.message },
      { status: 500 }
    );
  }
}
