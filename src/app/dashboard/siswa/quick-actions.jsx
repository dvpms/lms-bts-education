import Link from "next/link";
import { Books, ChartLineUp } from "phosphor-react";

export default function QuickActionsSiswa() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Kartu Kursus Saya */}
      <Link
        href="/dashboard/siswa/my-courses"
        className="group block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-green-500 border-2 border-transparent hover:-translate-y-2 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-500 transition-colors">
            <Books
              className="text-3xl text-green-600 group-hover:text-white transition-colors"
              weight="bold"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Kursus Saya</h3>
            <p className="text-sm text-gray-500 mt-1">
              Lihat dan akses semua kursus Anda.
            </p>
          </div>
        </div>
      </Link>
      {/* Kartu Nilai & Progres */}
      <Link
        href="/dashboard/siswa/progress"
        className="group block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-blue-500 border-2 border-transparent hover:-translate-y-2 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors">
            <ChartLineUp
              className="text-3xl text-blue-600 group-hover:text-white transition-colors"
              weight="bold"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nilai & Progres</h3>
            <p className="text-sm text-gray-500 mt-1">
              Lihat rekapitulasi nilai dan progres belajar.
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
