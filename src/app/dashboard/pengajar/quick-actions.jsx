import Link from "next/link";
import { Books, UploadSimple, UserPlus } from "phosphor-react";
export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Kartu Buat Kursus */}
      <Link
        href="/dashboard/pengajar/courses"
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
            <h3 className="text-lg font-bold text-gray-900">Buat Kursus</h3>
            <p className="text-sm text-gray-500 mt-1">
              Buat, edit, dan atur kursus Anda.
            </p>
          </div>
        </div>
      </Link>
      {/* Kartu Upload Materi */}
      <Link
        href="/dashboard/pengajar/courses"
        className="group block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-blue-500 border-2 border-transparent hover:-translate-y-2 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors">
            <UploadSimple
              className="text-3xl text-blue-600 group-hover:text-white transition-colors"
              weight="bold"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Upload Materi</h3>
            <p className="text-sm text-gray-500 mt-1">
              Unggah materi pembelajaran baru.
            </p>
          </div>
        </div>
      </Link>
      {/* Kartu Tambah User */}
      <Link
        href="/dashboard/pengajar/users"
        className="group block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-yellow-500 border-2 border-transparent hover:-translate-y-2 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-100 rounded-full group-hover:bg-yellow-500 transition-colors">
            <UserPlus
              className="text-3xl text-yellow-600 group-hover:text-white transition-colors"
              weight="bold"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tambah User</h3>
            <p className="text-sm text-gray-500 mt-1">
              Tambah pengajar atau siswa baru.
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
