"use client";

import Sidebar from "@/components/Sidebar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Komponen Header sederhana
const Header = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm p-4 flex justify-between items-center">
    <div />
    <div className="flex items-center">
      <span className="text-sm mr-4">Selamat datang, {user?.email}</span>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
      >
        Logout
      </button>
    </div>
  </header>
);

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchUser = async () => {
      // Mengambil data sesi login
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Mengambil data profil (termasuk peran) dari tabel public.users
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error || !userData) {
        // Jika data profil tidak ditemukan, logout paksa
        console.error(
          "Error fetching user role or user not found in public table.",
          error
        );
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // Menggabungkan data auth dan data profil
      const completeUser = { ...session.user, role: userData.role };
      setUser(completeUser);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memuat data pengguna...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Melemparkan peran pengguna ke Sidebar */}
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
