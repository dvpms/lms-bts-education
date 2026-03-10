"use client";
import Link from "next/link";
import QuickActionsSiswa from "./quick-actions";

export default function SiswaDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Dashboard
        </h2>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali! Pilih menu di bawah untuk memulai.
        </p>
      </div>
      <QuickActionsSiswa />
    </div>
  );
}
