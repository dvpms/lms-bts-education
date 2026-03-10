import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Fungsi untuk menangani permintaan GET ke /api/courses
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (newCookies) => {
          newCookies.forEach(({ name, value, options }) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (e) {}
          });
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Tidak diizinkan" }, { status: 401 });
    }

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id_pengajar", user.id);

    if (error) throw error;
    return NextResponse.json({ data: courses });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching courses", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menangani permintaan POST ke /api/courses
export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (newCookies) => {
          newCookies.forEach(({ name, value, options }) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (e) {}
          });
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    // Ambil role dari tabel users (public)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData || userData.role !== "pengajar") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { nama_course, deskripsi } = await request.json();

    if (!nama_course) {
      return NextResponse.json(
        { message: "Nama kursus wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([{ nama_course, deskripsi, id_pengajar: user.id }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(
      { message: "Kursus berhasil dibuat", data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating course", error: error.message },
      { status: 500 }
    );
  }
}
