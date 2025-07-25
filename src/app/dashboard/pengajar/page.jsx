"use client";
import QuickActions from "./quick-actions";

export default function PengajarDashboard() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Pengajar</h1>
      <QuickActions />
      {/* Tambahkan ringkasan statistik, grafik, atau aktivitas terbaru di sini */}
      <div className="mt-8 text-gray-500 text-sm">
        Selamat datang di dashboard pengajar. Silakan gunakan menu di samping
        untuk mengelola kursus, user, dan tugas.
      </div>
    </div>
  );
}
