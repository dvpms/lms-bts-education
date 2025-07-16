"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link"; // 1. Impor komponen Link

export default function StudentCourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("materi");
  const params = useParams();
  const { id: courseId } = params;

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    const supabase = await createSupabaseBrowserClient();
    try {
      const [courseRes, materialsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/materials`),
        fetch(`/api/assignments?courseId=${courseId}`),
      ]);
      const courseData = await courseRes.json();
      let materialsData = await materialsRes.json();
      let assignmentsData = await assignmentsRes.json();

      setCourse(courseData.data);

      if (materialsData.data) {
        const materialsWithUrls = await Promise.all(
          materialsData.data.map(async (m) => {
            const { data } = await supabase.storage
              .from("lms-file")
              .createSignedUrl(m.file_path, 3600);
            return { ...m, publicUrl: data.signedUrl };
          })
        );
        setMaterials(materialsWithUrls);
      }

      if (assignmentsData.data) {
        const assignmentsWithUrls = await Promise.all(
          assignmentsData.data.map(async (a) => {
            const { data } = await supabase.storage
              .from("lms-file")
              .createSignedUrl(a.file_path, 3600);
            return { ...a, publicUrl: data.signedUrl };
          })
        );
        setAssignments(assignmentsWithUrls);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Memuat data detail kursus...</div>;
  if (!course) return <div>Kursus tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{course.nama_course}</h1>
      <p className="text-gray-600 mb-8">{course.deskripsi}</p>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("materi")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "materi"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Materi Pembelajaran
          </button>
          <button
            onClick={() => setActiveTab("tugas")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tugas"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tugas
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "materi" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Daftar Materi</h2>
            <div className="space-y-4">
              {materials.length > 0 ? (
                materials.map((m) => (
                  <a
                    key={m.material_id}
                    href={m.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border rounded-md hover:bg-gray-50"
                  >
                    <p className="font-semibold text-blue-600 hover:underline">
                      {m.judul_materi}
                    </p>
                    <p className="text-sm text-gray-500">{m.deskripsi}</p>
                  </a>
                ))
              ) : (
                <p className="text-gray-500">
                  Belum ada materi untuk kursus ini.
                </p>
              )}
            </div>
          </div>
        )}
        {activeTab === "tugas" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Daftar Tugas</h2>
            <div className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((a) => (
                  <div
                    key={a.assignment_id}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{a.judul_tugas}</p>
                      <p className="text-sm text-gray-500">{a.instruksi}</p>
                    </div>
                    {/* --- PERUBAHAN DI SINI --- */}
                    {/* 2. Bungkus tombol dengan komponen Link */}
                    <Link
                      href={`/dashboard/siswa/assignments/${a.assignment_id}`}
                    >
                      <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                        Kerjakan
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Belum ada tugas untuk kursus ini.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
