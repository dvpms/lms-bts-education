// Fungsi untuk mendaftarkan siswa baru ke dalam kursus
export async function POST(request) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Memeriksa apakah pengguna yang login adalah 'pengajar'
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Validasi user harus login dan berperan sebagai 'pengajar'

    if (!user) {
      return NextResponse.json(
        { message: "Hanya pengajar yang diizinkan" },
        { status: 403 }
      );
    }

    // 2. Mengambil data dari body permintaan
    const { id_course, id_siswa } = await request.json();

    if (!id_course || !id_siswa) {
      return NextResponse.json(
        { message: "ID Kursus dan ID Siswa wajib diisi" },
        { status: 400 }
      );
    }

    // 3. Memasukkan data pendaftaran baru ke database
    const { data, error } = await supabase
      .from("enrollments")
      .insert([{ id_course, id_siswa }])
      .select()
      .single();

    // Menangani error jika siswa sudah terdaftar (karena UNIQUE constraint)
    if (error && error.code === "23505") {
      // Kode error untuk pelanggaran unique
      return NextResponse.json(
        { message: "Siswa ini sudah terdaftar di kursus tersebut." },
        { status: 409 }
      ); // 409 Conflict
    }

    if (error) throw error;

    // 4. Mengembalikan respons berhasil
    return NextResponse.json(
      { message: "Siswa berhasil didaftarkan", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error enrolling student", error: error.message },
      { status: 500 }
    );
  }
}
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Fungsi untuk mengambil semua pendaftaran (siswa) dalam sebuah kursus
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
    // 1. Memeriksa apakah pengguna sudah login
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    // 2. Mengambil data dari tabel 'enrollments'
    // dan juga mengambil data 'nama_lengkap' dari tabel 'users' yang terhubung
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(
        `
        enrollment_id,
        id_siswa,
        users (
          nama_lengkap
        )
      `
      )
      .eq("id_course", courseId);

    if (error) throw error;

    // 3. Mengembalikan data pendaftaran
    return NextResponse.json({ data: enrollments });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching enrollments", error: error.message },
      { status: 500 }
    );
  }
}
