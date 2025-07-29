"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FiArrowLeft, FiDownload, FiCheckCircle } from "react-icons/fi";

// Komponen untuk setiap baris submission (UI sesuai permintaan)
const SubmissionItem = ({ submission, onGradeSubmit }) => {
  const [nilai, setNilai] = useState(submission.nilai || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownloadSubmission = async (filePath) => {
    const supabase = await createSupabaseBrowserClient();
    const { data, error } = await supabase.storage
      .from("lms-file")
      .createSignedUrl(filePath, 60 * 60);
    if (error || !data?.signedUrl) {
      alert("Gagal membuat signed URL untuk file.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onGradeSubmit(submission.submission_id, nilai, feedback);
      alert("Penilaian berhasil disimpan!");
    } catch (error) {
      alert(`Gagal menyimpan penilaian: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sudahDinilai =
    submission.nilai !== null &&
    submission.feedback !== null &&
    submission.nilai !== "";

  return (
    <div className="submission-item p-5 border rounded-lg bg-slate-50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-900">{submission.users.nama_lengkap}</p>
          <p className="text-sm text-gray-500">
            Dikumpulkan pada: {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {sudahDinilai && (
            <span className="graded-badge px-2 py-1 text-xs font-semibold leading-tight text-green-700 bg-green-100 rounded-full flex items-center gap-1">
              <FiCheckCircle className="inline-block" /> Sudah Dinilai
            </span>
          )}
          <button
            type="button"
            onClick={() => handleDownloadSubmission(submission.file_path)}
            className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-semibold"
          >
            <FiDownload />
            <span>Unduh Jawaban</span>
          </button>
        </div>
      </div>
      {/* Form Penilaian Fungsional */}
      <form className="grading-form" onSubmit={handleSubmitGrade}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nilai</label>
            <input
              type="number"
              name="nilai"
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
              placeholder="0-100"
              value={nilai}
              onChange={(e) => setNilai(e.target.value)}
              disabled={sudahDinilai}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback</label>
            <textarea
              name="feedback"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
              placeholder="Tuliskan feedback untuk siswa..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={sudahDinilai}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          {/* <button type="button" className="delete-btn px-5 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 hidden">Hapus</button> */}
          {!sudahDinilai && (
            <button
              type="submit"
              className="submit-btn px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Komponen Utama Halaman
export default function GradingPage() {
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { id: assignmentId } = params;

  // Dummy assignment & course info for demo
  const dummyAssignment = {
    judul: "Latihan Kalkulator Sederhana",
    course: "Dasar Pemrograman Python",
  };

  // Dummy submissions for demo
  const dummySubmissions = [
    {
      submission_id: "dummy-1",
      users: { nama_lengkap: "Budi Santoso" },
      submitted_at: new Date().toISOString(),
      file_path: "dummy/budi-jawaban.pdf",
      nilai: 100,
      feedback: "Good job, Budi! Jawaban lengkap dan benar.",
    },
    {
      submission_id: "dummy-2",
      users: { nama_lengkap: "Siti Aminah" },
      submitted_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      file_path: "dummy/siti-jawaban.pdf",
      nilai: null,
      feedback: null,
    },
    {
      submission_id: "dummy-3",
      users: { nama_lengkap: "Rizky Pratama" },
      submitted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      file_path: "dummy/rizky-jawaban.pdf",
      nilai: null,
      feedback: null,
    },
  ];

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    try {
      // Mengambil data semua pengumpulan tugas untuk assignment ini
      const response = await fetch(
        `/api/assignments/${assignmentId}/submissions`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSubmissions(data.data || []);
      // (Opsional) Mengambil detail tugasnya itu sendiri jika perlu
      // const assignmentRes = await fetch(`/api/assignments/${assignmentId}`);
      // const assignmentData = await assignmentRes.json();
      // setAssignment(assignmentData.data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleGradeSubmit = async (submissionId, nilai, feedback) => {
    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nilai, feedback }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    fetchSubmissions(); // Muat ulang data setelah menilai
  };

  if (loading) return <div>Memuat data pengumpulan tugas...</div>;

  // Always show dummy submissions for demo if no real data
  const displaySubmissions = submissions.length > 0 ? submissions : dummySubmissions;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <button
          type="button"
          className="text-sm text-green-600 hover:underline flex items-center gap-2 mb-4"
          onClick={() => router.push("/dashboard/pengajar/courses")}
        >
          <FiArrowLeft />
          Kembali ke Detail Kursus
        </button>
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Penilaian Tugas</h2>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Tinjau dan berikan nilai untuk tugas
          <span className="font-semibold"> "{dummyAssignment.judul}" </span>
          dari kursus
          <span className="font-semibold"> "{dummyAssignment.course}"</span>.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Daftar Pengumpulan</h3>
        <div className="space-y-6">
          {displaySubmissions.length > 0 ? (
            displaySubmissions.map((sub) => (
              <SubmissionItem
                key={sub.submission_id}
                submission={sub}
                onGradeSubmit={handleGradeSubmit}
              />
            ))
          ) : (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md">
              Belum ada siswa yang mengumpulkan tugas ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
