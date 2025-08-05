"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Layout,
  Books,
  Users,
  ChartBar,
  SignOut,
  UserPlus,
} from "phosphor-react";


// Daftar menu sidebar untuk pengajar
const teacherNavLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Layout weight="fill" size={22} />,
  },
  {
    name: "Kelola Kursus",
    href: "/dashboard/pengajar/courses",
    icon: <Books weight="fill" size={22} />,
  },
  {
    name: "Kelola User",
    href: "/dashboard/pengajar/users",
    icon: <Users weight="fill" size={22} />,
  },
  {
    name: "Laporan Progres",
    href: "/dashboard/pengajar/progress",
    icon: <ChartBar weight="fill" size={22} />,
  },
];

// Daftar menu sidebar untuk siswa
const studentNavLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Layout weight="fill" size={22} />,
  },
  {
    name: "Kursus Saya",
    href: "/dashboard/siswa/my-courses",
    icon: <Books weight="fill" size={22} />,
  },
  {
    name: "Nilai & Progres",
    href: "/dashboard/siswa/progress",
    icon: <ChartBar weight="fill" size={22} />,
  },
];

export default function Sidebar({
  userRole = "pengajar",
  userName = "Budi Pengajar",
  avatarUrl = "https://placehold.co/100x100/4A5568/FFFFFF?text=BP",
}) {
  const pathname = usePathname();
  const navLinks = userRole === "siswa" ? studentNavLinks : teacherNavLinks;

  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 to-green-800 text-white flex-shrink-0 flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-green-700/50">
        <Image
          src="/logo.png"
          alt="Logo BTS Education"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div>
          <h1 className="text-lg font-semibold">LMS BTS</h1>
          <span className="text-xs bg-white/20 text-green-100 font-semibold px-2 py-0.5 rounded-full">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
      </div>
      <nav className="mt-6 flex-grow px-4 space-y-2">
        {navLinks.map((link) => {
          let isActive;
          if (link.href === "/dashboard") {
            isActive = pathname === link.href;
          } else {
            isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          }
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-white text-green-800 shadow-lg font-semibold"
                  : "text-green-100 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="ml-3">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-green-700/50">
        <Link
          href="#"
          className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Image
            className="h-9 w-9 rounded-full object-cover"
            src={avatarUrl}
            alt="Avatar"
            width={36}
            height={36}
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-green-200">Lihat Profil</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
