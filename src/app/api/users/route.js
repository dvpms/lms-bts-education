import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
// POST: Tambah user baru (pakai admin client)
export async function POST(request) {
  const logError = (context, error) => {
    console.error(`[User Registration Error - ${context}]`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  };
  try {
    const body = await request.json();
    const { email, nama_lengkap, role, password } = body;
    const validationErrors = [];
    if (!email) validationErrors.push("Email wajib diisi");
    if (!nama_lengkap) validationErrors.push("Nama lengkap wajib diisi");
    if (!role) validationErrors.push("Role wajib diisi");
    if (!password) validationErrors.push("Password wajib diisi");
    if (validationErrors.length > 0) {
      return NextResponse.json({ message: "Validasi gagal", errors: validationErrors }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();
    // Cek email hanya di tabel users (karena Auth dan tabel users selalu sinkron)
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single();
    if (existingUser) {
      return NextResponse.json({ message: "Gagal mendaftar", error: "Email sudah terdaftar" }, { status: 409 });
    }
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, nama_lengkap }
    });
    if (authError) {
      logError("Auth User Creation", authError);
      return NextResponse.json({ message: "Gagal membuat user", error: authError.message }, { status: 500 });
    }
    const { user } = authData;
    const { error: dbError } = await supabase.from("users").upsert({
      user_id: user.id,
      email,
      nama_lengkap,
      role,
      created_at: new Date().toISOString()
    });
    if (dbError) {
      try { await adminClient.auth.admin.deleteUser(user.id); } catch (rollbackError) { logError("Auth User Rollback", rollbackError); }
      logError("User Table Insert", dbError);
      return NextResponse.json({ message: "Gagal menambah user", error: dbError.message }, { status: 500 });
    }
    return NextResponse.json({
      message: "User berhasil ditambahkan",
      user: { id: user.id, email, nama_lengkap, role }
    }, { status: 201 });
  } catch (error) {
    logError("Unexpected Error", error);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: error.message }, { status: 500 });
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

// DELETE: Hapus user dari Auth dan tabel users
export async function DELETE(request) {
  const supabase = await createSupabaseServerClient();
  const adminClient = await createSupabaseAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json({ message: "user_id wajib diisi" }, { status: 400 });
    }
    // Hapus user dari Auth pakai admin client
    const { error: authError } = await adminClient.auth.admin.deleteUser(user_id);
    if (authError) {
      return NextResponse.json({ message: "Gagal hapus user dari Auth", error: authError.message }, { status: 500 });
    }
    // Hapus user dari tabel users
    const { error } = await supabase.from("users").delete().eq("user_id", user_id);
    if (error) throw error;
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus user", error: error.message }, { status: 500 });
  }
}
