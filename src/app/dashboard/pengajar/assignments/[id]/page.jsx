"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FiArrowLeft, FiDownload, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";

const statusOptions = [
  { value: "Selesai", label: "Selesai" },
  { value: "Revisi", label: "Revisi" },
  { value: "Belum Dinilai", label: "Belum Dinilai" },
];

const SubmissionItem = ({ submission, onGradeSubmit }) => {
  const [status, setStatus] = useState(submission.status || "Belum Dinilai");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(
    submission.status === "Belum Dinilai"
  );

  const handleDownloadSubmission = async (filePath) => {
    const supabase = await createSupabaseBrowserClient();
    const { data, error } = await supabase.storage
      .from("lms-file")
      .createSignedUrl(filePath, 60 * 60, { download: true });
    if (error || !data?.signedUrl) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengunduh file",
        text: "Gagal membuat signed URL untuk file.",
      });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onGradeSubmit(submission.submission_id, status, feedback);
      await Swal.fire({
        icon: "success",
        title: "Status penilaian berhasil disimpan!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan status penilaian",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sudahDinilai =
    submission.status && submission.status !== "Belum Dinilai";

  return (
    <div className="submission-item p-5 border rounded-lg bg-slate-50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-semibold text-gray-900">
            {submission.users.nama_lengkap}
          </p>
          <p className="text-sm text-gray-500">
            Dikumpulkan pada:{" "}
            {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {submission.status === "Selesai" && (
            <span className="graded-badge px-2 py-1 text-xs font-semibold leading-tight text-green-700 bg-green-100 rounded-full flex items-center gap-1">
              <FiCheckCircle className="inline-block" /> Selesai
            </span>
          )}
          {submission.status === "Revisi" && (
            <span className="graded-badge px-2 py-1 text-xs font-semibold leading-tight text-yellow-800 bg-yellow-100 rounded-full flex items-center gap-1">
              <svg
                className="inline-block w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>{" "}
              Revisi
            </span>
          )}
          {submission.status === "Belum Dinilai" && (
            <span className="graded-badge px-2 py-1 text-xs font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full flex items-center gap-1">
              <svg
                className="inline-block w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>{" "}
              Belum Dinilai
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status Penilaian
            </label>
            <select
              name="status"
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!editMode && sudahDinilai}
              required
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Feedback
            </label>
            <textarea
              name="feedback"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-200 disabled:cursor-not-allowed"
              placeholder="Tuliskan feedback untuk siswa..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={!editMode && sudahDinilai}
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          {sudahDinilai && !editMode && (
            <button
              type="button"
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
              onClick={() => setEditMode(true)}
            >
              Edit Penilaian
            </button>
          )}
          {(editMode || !sudahDinilai) && (
            <button
              type="submit"
              className="submit-btn px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
          )}
          {editMode && sudahDinilai && (
            <button
              type="button"
              className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
              onClick={() => {
                setStatus(submission.status || "Belum Dinilai");
                setFeedback(submission.feedback || "");
                setEditMode(false);
              }}
            >
              Batal
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
      users: { nama_lengkap: "Budi Santoso (dummy)" },
      submitted_at: new Date().toISOString(),
      file_path: "dummy/budi-jawaban.pdf",
      nilai: 100,
      feedback: "Good job, Budi! Jawaban lengkap dan benar.)",
    },
    {
      submission_id: "dummy-2",
      users: { nama_lengkap: "Siti Aminah (dummy)" },
      submitted_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      file_path: "dummy/siti-jawaban.pdf",
      nilai: null,
      feedback: null,
    },
    {
      submission_id: "dummy-3",
      users: { nama_lengkap: "Rizky Pratama (dummy)" },
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

  const handleGradeSubmit = async (submissionId, status, feedback) => {
    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, feedback }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    fetchSubmissions(); // Muat ulang data setelah menilai
  };

  if (loading) return <div>Memuat data pengumpulan tugas...</div>;

  // Always show dummy submissions for demo if no real data
  const displaySubmissions =
    submissions.length > 0 ? submissions : dummySubmissions;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <button
          type="button"
          className="text-sm text-green-600 hover:underline flex items-center gap-2 mb-4"
          onClick={() => router.back()}
        >
          <FiArrowLeft />
          Kembali ke Detail Kursus
        </button>
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Penilaian Tugas
        </h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Daftar Pengumpulan
        </h3>
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
