"use client";

import Link from "next/link";

// Data untuk kartu-kartu menu
const menuItems = [
  {
    title: "Kelola Kursus",
    description: "Tambah, edit, dan kelola semua kursus yang Anda ajarkan.",
    href: "/dashboard/pengajar/courses",
    icon: "📚", // Ganti dengan ikon yang lebih baik nanti
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
  return (
    <div>
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard LMS</h1>
        <p className="mt-1 text-gray-600">
          Selamat datang kembali! Pilih menu di bawah untuk memulai.
        </p>
      </div>

      {/* Grid untuk Kartu Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
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
