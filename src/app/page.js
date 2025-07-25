"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }
      // Jika berhasil, arahkan ke halaman dashboard
      router.push("/dashboard");
    } catch (error) {
      setError(error.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-inter bg-gray-100">
      {/* Kolom Kiri (Branding) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-green-500 to-lime-400 text-white p-12 flex-col justify-between">
        <div></div>
        <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Logo BTS Education"
            width={500}
            height={500}
            className="opacity-80"
            priority
          />
        </div>
        <div className="text-xs text-green-200">
          &copy; 2025 BTS Education. All rights reserved.
        </div>
      </div>

      {/* Kolom Kanan (Form Login) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo untuk tampilan mobile */}
          <div className="md:hidden flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Logo BTS Education"
              width={96}
              height={96}
              priority
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center md:text-left">
            Selamat Datang di
            <br />
            LMS BTS Education
          </h2>
          <p className="mt-2 text-gray-600 text-center md:text-left">
            Silakan masuk untuk melanjutkan.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  placeholder="anda@contoh.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Ingat saya
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Lupa password?
                </a>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-gray-400"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?
            <a
              href="#"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Daftar sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
