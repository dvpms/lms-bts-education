-- Membuat tabel untuk menyimpan catatan progres manual dari pengajar
CREATE TABLE public.progress_records (
    record_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- Menghubungkan ke pendaftaran spesifik (siswa di dalam kursus)
    enrollment_id BIGINT NOT NULL REFERENCES public.enrollments(enrollment_id) ON DELETE CASCADE,
    -- Catatan yang diinput oleh pengajar
    note TEXT NOT NULL,
    -- Tanggal kapan catatan dibuat
    record_date TIMESTAMPTZ DEFAULT NOW()
);

-- Memberi komentar untuk menjelaskan tabel baru
COMMENT ON TABLE public.progress_records IS 'Mencatat progres belajar siswa secara manual oleh pengajar.';