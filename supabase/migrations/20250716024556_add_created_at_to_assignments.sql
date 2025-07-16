-- Menambahkan kolom created_at ke tabel assignments
ALTER TABLE public.assignments
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

-- Memberi komentar untuk menjelaskan kolom baru
COMMENT ON COLUMN public.assignments.created_at IS 'Timestamp kapan tugas dibuat';