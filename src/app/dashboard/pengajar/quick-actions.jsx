"use client";
import Link from "next/link";
import { FiPlusCircle, FiUpload, FiUserPlus } from "react-icons/fi";

export default function QuickActions() {
  return (
    <div className="flex gap-4 mb-6">
      <Link href="/dashboard/pengajar/courses" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
        <FiPlusCircle className="text-lg" />
        <span>Buat Kursus</span>
      </Link>
      <Link href="/dashboard/pengajar/courses" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
        <FiUpload className="text-lg" />
        <span>Upload Materi</span>
      </Link>
      <Link href="/dashboard/pengajar/users" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition">
        <FiUserPlus className="text-lg" />
        <span>Tambah User</span>
      </Link>
    </div>
  );
}
