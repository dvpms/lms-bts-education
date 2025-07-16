"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Daftar menu untuk setiap peran
const teacherNavLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Kelola Kursus", href: "/dashboard/pengajar/courses" },
  { name: "Laporan Progres", href: "/dashboard/pengajar/progress" },
  { name: "Penilaian Tugas", href: "/dashboard/pengajar/assignments" },

];

const studentNavLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Kursus Saya", href: "/dashboard/siswa/my-courses" },
  { name: "Progres Saya", href: "/dashboard/siswa/progress" },

];

export default function Sidebar({ userRole }) {
  const pathname = usePathname();

  // Pilih daftar menu berdasarkan peran pengguna
  const navLinks = userRole === "pengajar" ? teacherNavLinks : studentNavLinks;

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">LMS BTS</h1>
        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full">
          {userRole}
        </span>
      </div>
      <nav className="mt-6">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-slate-200 ${
                isActive
                  ? "bg-blue-100 text-blue-600 border-r-4 border-blue-600"
                  : ""
              }`}
            >
              <span className="mx-4 font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
