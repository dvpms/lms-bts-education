import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua pendaftaran (siswa) dalam sebuah kursus
export async function GET(request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  try {
    // 1. Memeriksa apakah pengguna sudah login
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // 2. Mengambil data user dengan filter role
    let query = supabase
      .from("users")
      .select("user_id, nama_lengkap, email, role");
    if (role) {
      query = query.eq("role", role);
    }
    const { data: users, error } = await query;
    if (error) throw error;

    // 3. Mengembalikan data user
    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users", error: error.message },
      { status: 500 }
    );
  }
}


// --- CRUD USER API ROUTES ---
// POST: Tambah user baru
export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  try {
    const body = await request.json();
    const { email, nama_lengkap, role, password } = body;
    if (!email || !nama_lengkap || !role || !password) {
      return NextResponse.json({ message: "Data user wajib diisi" }, { status: 400 });
    }
    // Buat user auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw authError;
    const { user } = authData;
    // Insert ke tabel users
    const { error: dbError } = await supabase.from("users").insert({
      user_id: user.id,
      email,
      nama_lengkap,
      role,
    });
    if (dbError) throw dbError;
    return NextResponse.json({ message: "User berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah user", error: error.message }, { status: 500 });
  }
}

// PATCH: Edit user (parsial)
export async function PATCH(request) {
  const supabase = await createSupabaseServerClient();
  try {
    const body = await request.json();
    const { user_id, nama_lengkap, role } = body;
    if (!user_id) {
      return NextResponse.json({ message: "user_id wajib diisi" }, { status: 400 });
    }
    const updateData = {};
    if (nama_lengkap !== undefined) updateData.nama_lengkap = nama_lengkap;
    if (role !== undefined) updateData.role = role;
    const { error } = await supabase.from("users").update(updateData).eq("user_id", user_id);
    if (error) throw error;
    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update user", error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus user
export async function DELETE(request) {
  const supabase = await createSupabaseServerClient();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json({ message: "user_id wajib diisi" }, { status: 400 });
    }
    const { error } = await supabase.from("users").delete().eq("user_id", user_id);
    if (error) throw error;
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus user", error: error.message }, { status: 500 });
  }
}
