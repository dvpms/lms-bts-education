-- Script SQL untuk insert test user dengan role pengajar
-- User ini akan terhubung dengan Supabase Auth yang sudah ada

INSERT INTO users (nama_lengkap, email, password, role) VALUES 
('Test Pengajar', 'test@example.com', 'testpassword123', 'pengajar')
ON CONFLICT (email) DO UPDATE SET 
  role = 'pengajar',
  nama_lengkap = 'Test Pengajar';
