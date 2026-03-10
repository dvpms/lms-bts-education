"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Code, GitBranch, CheckCircle, WarningCircle } from "phosphor-react";

export default function StudentCourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("materi");
  const params = useParams();
  const router = useRouter();
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
              .createSignedUrl(m.file_path, 3600, { download: true });
            return { ...m, publicUrl: data.signedUrl };
          })
        );
        setMaterials(materialsWithUrls);
      }

      if (assignmentsData.data) {
        // Cek status pengumpulan untuk setiap assignment
        const assignmentsWithStatus = await Promise.all(
          assignmentsData.data.map(async (a) => {
            const { data } = await supabase.storage
              .from("lms-file")
              .createSignedUrl(a.file_path, 3600, { download: true });
            // Cek status pengumpulan siswa
            let submissionStatus = null;
            let submissionFeedback = null;
            let submittedAt = null;
            try {
              const res = await fetch(`/api/submissions/check?assignmentId=${a.assignment_id}`);
              const result = await res.json();
              if (result.data) {
                submissionStatus = result.data.status;
                submissionFeedback = result.data.feedback;
                submittedAt = result.data.submitted_at;
              }
            } catch (e) {
              submissionStatus = null;
            }
            return { ...a, publicUrl: data.signedUrl, submissionStatus, submissionFeedback, submittedAt };
          })
        );
        setAssignments(assignmentsWithStatus);
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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/siswa/my-courses")}
          className="text-sm text-green-600 hover:underline flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="ph ph-arrow-left" size={20} />
          Kembali ke Kursus Saya
        </button>
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          {course.nama_course}
        </h2>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Selamat belajar! Akses semua materi dan kerjakan tugas yang diberikan
          oleh pengajar Anda di bawah ini.
        </p>
      </div>

      {/* Navigasi Tab */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("materi")}
            className={`tab-btn py-4 px-1 border-b-2 font-semibold text-base ${
              activeTab === "materi"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Materi Pembelajaran
          </button>
          <button
            onClick={() => setActiveTab("tugas")}
            className={`tab-btn py-4 px-1 border-b-2 font-medium text-base ${
              activeTab === "tugas"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tugas
          </button>
        </nav>
      </div>

      {/* Konten Tab */}
      <div className="mt-8">
        {/* Konten Tab Materi */}
        {activeTab === "materi" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Daftar Materi
            </h3>
            <div className="space-y-4">
              {materials.length > 0 ? (
                materials.map((m, idx) => (
                  <a
                    key={m.material_id}
                    href={m.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="p-3 bg-green-100 rounded-full">
                      {idx % 2 === 0 ? (
                        <Code className="ph-bold ph-code text-2xl text-green-600" />
                      ) : (
                        <GitBranch className="ph-bold ph-git-branch text-2xl text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-green-600">
                        {m.judul_materi}
                      </p>
                      <p className="text-sm text-gray-500">{m.deskripsi}</p>
                    </div>
                    <span className="ml-auto text-green-600 text-sm font-semibold group-hover:underline">Unduh</span>
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

        {/* Konten Tab Tugas */}
        {activeTab === "tugas" && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Daftar Tugas
            </h3>
            <div className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((a) => (
                  <div
                    key={a.assignment_id}
                    className={`p-4 border rounded-lg flex justify-between items-center ${
                      a.submissionStatus === "Selesai" ? "bg-green-50 border-green-200" : a.submissionStatus === "Revisi" ? "bg-yellow-50 border-yellow-200" : a.submissionStatus === "Belum Dinilai" ? "bg-gray-50 border-gray-200" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {a.judul_tugas}
                      </p>
                      <p className="text-sm text-gray-500">{a.instruksi}</p>
                      {a.submissionStatus === "Revisi" && (
                        <div className="mt-2 flex items-center gap-2 text-yellow-800 font-semibold text-sm">
                          <WarningCircle className="ph-bold ph-warning-circle" size={18} />
                          <span>Perlu Revisi</span>
                          {a.submissionFeedback && (
                            <span className="ml-2 text-xs text-yellow-700">Feedback: {a.submissionFeedback}</span>
                          )}
                        </div>
                      )}
                      {a.submissionStatus === "Selesai" && (
                        <div className="mt-2 flex items-center gap-2 text-green-700 font-semibold text-sm">
                          <CheckCircle className="ph-bold ph-check-circle" size={18} />
                          <span>Selesai</span>
                        </div>
                      )}
                      {a.submissionStatus === "Belum Dinilai" && (
                        <div className="mt-2 flex items-center gap-2 text-gray-700 font-semibold text-sm">
                          <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                          <span>Menunggu Dinilai</span>
                        </div>
                      )}
                    </div>
                    {a.submissionStatus === "Revisi" ? (
                      <Link href={`/dashboard/siswa/assignments/${a.assignment_id}`}>
                        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 font-semibold">
                          Revisi
                        </button>
                      </Link>
                    ) : a.submissionStatus === "Selesai" ? (
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <CheckCircle className="ph-bold ph-check-circle" size={22} />
                        <span>Sudah Dikerjakan</span>
                      </div>
                    ) : a.submissionStatus === "Belum Dinilai" ? (
                      <Link href={`/dashboard/siswa/assignments/${a.assignment_id}`}>
                        <div className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold">
                          Lihat Status
                        </div>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/siswa/assignments/${a.assignment_id}`}>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                          Kerjakan
                        </button>
                      </Link>
                    )}
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
