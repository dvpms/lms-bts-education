-- =================================================================
-- RESET SCRIPT (Jalankan ini untuk membersihkan yang lama)
-- =================================================================
-- Hapus trigger yang lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Hapus fungsi yang lama jika ada
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Hapus semua tabel yang bergantung dan tabel itu sendiri secara berurutan
-- Dimulai dari tabel yang paling banyak memiliki ketergantungan
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Hapus tipe ENUM yang lama jika ada
DROP TYPE IF EXISTS user_role;


-- 1. Membuat kembali tipe ENUM untuk peran pengguna
CREATE TYPE user_role AS ENUM ('pengajar', 'siswa');

-- 2. Membuat kembali tabel 'users' dengan struktur yang BENAR
CREATE TABLE public.users (
    -- user_id sekarang adalah UUID dan menjadi FOREIGN KEY ke auth.users
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role user_role,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Membuat kembali tabel 'courses'
CREATE TABLE public.courses (
    course_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nama_course VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    id_pengajar UUID REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- 4. Membuat kembali tabel 'materials'
CREATE TABLE public.materials (
    material_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_course BIGINT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    judul_materi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    file_path TEXT, -- This will store the path from Supabase Storage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Membuat kembali tabel 'assignments'
CREATE TABLE public.assignments (
    assignment_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_course BIGINT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    judul_tugas VARCHAR(255) NOT NULL,
    instruksi TEXT,
    due_date TIMESTAMPTZ
);

-- 6. Membuat kembali tabel 'submissions'
CREATE TABLE public.submissions (
    submission_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_assignment BIGINT NOT NULL REFERENCES public.assignments(assignment_id) ON DELETE CASCADE,
    id_siswa UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    file_path TEXT, -- This will store the path from Supabase Storage
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    nilai INT,
    feedback TEXT
);


-- 7. Membuat kembali fungsi trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Memasukkan data pengguna baru ke tabel public.users
  INSERT INTO public.users (user_id, email, nama_lengkap, role)
  VALUES (
    new.id,
    new.email,
    -- Memberikan nilai default jika metadata tidak ada saat pendaftaran
    COALESCE(new.raw_user_meta_data->>'nama_lengkap', 'Pengguna Baru'),
    COALESCE(new.raw_user_meta_data->>'role', 'siswa')::user_role
  );
  RETURN new;
END;
$$;

-- 8. Membuat kembali trigger yang memanggil fungsi di atas
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
