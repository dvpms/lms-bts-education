-- Membuat tabel 'enrollments' untuk menghubungkan users dan courses
CREATE TABLE public.enrollments (
    enrollment_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    id_course BIGINT NOT NULL REFERENCES public.courses(course_id) ON DELETE CASCADE,
    id_siswa UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    -- Memastikan satu siswa hanya bisa mendaftar sekali di satu kursus
    UNIQUE(id_course, id_siswa)
);

-- Memberi komentar untuk menjelaskan tabel baru
COMMENT ON TABLE public.enrollments IS 'Mencatat pendaftaran siswa ke dalam kursus.';