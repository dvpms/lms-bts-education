"use client";
import Link from "next/link";
import QuickActions from "./pengajar/quick-actions";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PengajarDashboard from "./pengajar/page";

const studentMenuItems = [
  {
    title: "Kursus Saya",
    description: "Lihat dan akses semua kursus yang Anda ikuti.",
    href: "/dashboard/siswa/my-courses",
    icon: "📚",
  },
  {
    title: "Nilai & Progres",
    description: "Lihat nilai tugas dan progres belajar Anda.",
    href: "/dashboard/siswa/progress",
    icon: "📈",
  },
];

const teacherMenuItems = [
  {
    title: "Kelola Kursus",
    description: "Tambah, edit, dan kelola semua kursus yang Anda ajarkan.",
    href: "/dashboard/pengajar/courses",
    icon: "📚",
  },
  {
    title: "Materi Pembelajaran",
    description: "Akses materi dan sumber daya pembelajaran.",
    href: "/dashboard/materi",
    icon: "📄",
  },
  {
    title: "Tugas & Penilaian",
    description: "Kelola tugas dan lihat hasil penilaian.",
    href: "/dashboard/tugas",
    icon: "✅",
  },
];

export default function DashboardPage() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = await createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (error || !userData) {
        await supabase.auth.signOut();
        router.push("/");
        return;
      }
      setUserRole(userData.role);
      setLoading(false);
    };
    fetchRole();
  }, [router]);

  if (loading) {
    return <div>Memuat dashboard...</div>;
  }

  if (userRole === "pengajar") {
    return <PengajarDashboard />;
  }

  // Default: siswa
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard LMS</h1>
        <p className="mt-1 text-gray-600">
          Selamat datang kembali! Pilih menu di bawah untuk memulai.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentMenuItems.map((item) => (
          <Link href={item.href} key={item.title}>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
