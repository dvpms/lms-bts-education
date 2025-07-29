"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterPage() {
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("siswa"); // Nilai default adalah 'siswa'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();

  /**
   * Fungsi untuk menangani proses pendaftaran pengguna baru.
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Menggunakan fungsi pendaftaran bawaan dari Supabase
      // Kita juga mengirimkan data tambahan (nama dan peran) melalui 'options.data'
      const supabase = await createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nama_lengkap: namaLengkap,
            role: role,
          },
        },
      });

      // Jika Supabase mengembalikan error (misal, email sudah terdaftar)
      if (error) {
        throw error;
      }

      // Jika berhasil, tampilkan pesan sukses
      setSuccessMessage(
        "Pendaftaran berhasil!"
      );
      // Kosongkan form setelah berhasil
      setNamaLengkap("");
      setEmail("");
      setPassword("");
    } catch (error) {
      // Menampilkan pesan error kepada pengguna
      setError(error.message || "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="mt-2 text-sm text-gray-600">
            Daftar untuk mulai menggunakan LMS BTS Education
          </p>
        </div>

        {/* Form untuk pendaftaran */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="namaLengkap"
              className="text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </label>
            <input
              id="namaLengkap"
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nama Anda"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="anda@contoh.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Daftar sebagai
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="siswa">Siswa</option>
              <option value="pengajar">Pengajar</option>
            </select>
          </div>

          {/* Menampilkan pesan error atau sukses */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-500">
          Sudah punya akun?{" "}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
