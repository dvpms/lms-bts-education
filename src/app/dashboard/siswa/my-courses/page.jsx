"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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

  if (loading) return <div>Memuat daftar kursus Anda...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Kursus Saya</h1>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.enrollment_id}
              onClick={() => handleCourseClick(enrollment.courses.course_id)}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {enrollment.courses.nama_course}
              </h2>
              <p className="text-gray-600 text-sm">
                {enrollment.courses.deskripsi}
              </p>
            </div>
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
