"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBookOpen, FiUsers, FiBarChart2, FiClipboard } from "react-icons/fi";

// Daftar menu untuk setiap peran
const teacherNavLinks = [
  { name: "Dashboard", href: "/dashboard", icon: <FiBookOpen /> },
  { name: "Kelola Kursus", href: "/dashboard/pengajar/courses", icon: <FiUsers /> },
  { name: "Kelola User", href: "/dashboard/pengajar/users", icon: <FiUsers /> },
  { name: "Laporan Progres", href: "/dashboard/pengajar/progress", icon: <FiBarChart2 /> },
  { name: "Penilaian Tugas", href: "/dashboard/pengajar/assignments", icon: <FiClipboard /> },
];

const studentNavLinks = [
  { name: "Dashboard", href: "/dashboard", icon: <FiBookOpen /> },
  { name: "Kursus Saya", href: "/dashboard/siswa/my-courses", icon: <FiUsers /> },
  { name: "Progres Saya", href: "/dashboard/siswa/progress", icon: <FiBarChart2 /> },
];

export default function Sidebar({ userRole }) {
  const pathname = usePathname();

  // Pilih daftar menu berdasarkan peran pengguna
  const navLinks = userRole === "pengajar" ? teacherNavLinks : studentNavLinks;

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-50 to-slate-100 shadow-xl flex-shrink-0 border-r border-slate-200">
      <div className="p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-600 tracking-wide mb-2">LMS BTS</h1>
        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-full mb-2">
          {userRole}
        </span>
      </div>
      <nav className="mt-2">
        {navLinks.map((link) => {
          // Gunakan path yang benar-benar sama untuk highlight
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 my-1 rounded-lg transition-all duration-150 text-base font-medium hover:bg-blue-100 hover:text-blue-700 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
