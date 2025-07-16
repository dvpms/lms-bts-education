-- Menambahkan kolom file_path ke tabel assignments untuk menyimpan path file tugas
ALTER TABLE public.assignments
ADD COLUMN file_path TEXT;

-- Memberi komentar untuk menjelaskan kolom baru
COMMENT ON COLUMN public.assignments.file_path IS 'Path ke file tugas yang diunggah oleh pengajar di Supabase Storage';