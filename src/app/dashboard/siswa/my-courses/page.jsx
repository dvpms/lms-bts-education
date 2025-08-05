"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Komponen Utama Halaman
export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMyCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments/my-courses");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data kursus");
      }
      setEnrollments(data.data || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const handleCourseClick = (courseId) => {
    // Arahkan ke halaman detail kursus untuk siswa
    // Halaman ini akan kita buat selanjutnya
    router.push(`/dashboard/siswa/courses/${courseId}`);
  };

  if (loading) return <div className="p-8">Memuat daftar kursus Anda...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Kursus Saya
        </h2>
        <p className="text-gray-500 mt-1">
          Berikut adalah semua kursus di mana Anda terdaftar.
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.enrollment_id}
              href={"/dashboard/siswa/courses/" + enrollment.courses.course_id}
              className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {enrollment.courses.nama_course}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {enrollment.courses.deskripsi}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md">
          Anda belum terdaftar di kursus mana pun.
        </p>
      )}
    </div>
  );
}
