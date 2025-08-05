-- Membuat tipe data baru untuk status penilaian
CREATE TYPE submission_status AS ENUM ('Selesai', 'Revisi', 'Belum Dinilai');

-- Menghapus kolom 'nilai' yang lama dari tabel submissions
ALTER TABLE public.submissions
DROP COLUMN IF EXISTS nilai;

-- Menambahkan kolom 'status' yang baru ke tabel submissions
ALTER TABLE public.submissions
ADD COLUMN status submission_status DEFAULT 'Belum Dinilai';

-- Memberi komentar untuk menjelaskan kolom baru
COMMENT ON COLUMN public.submissions.status IS 'Status penilaian tugas (Selesai, Revisi, Belum Dinilai)';