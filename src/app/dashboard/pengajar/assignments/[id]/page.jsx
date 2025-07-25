"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Komponen untuk setiap baris submission
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
    <div className="p-4 border rounded-md bg-slate-50">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{submission.users.nama_lengkap}</p>
          <p className="text-sm text-gray-500">
            Dikumpulkan pada:{" "}
            {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => handleDownloadSubmission(submission.file_path)}
          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
        >
          Unduh Jawaban
        </button>
      </div>
      {sudahDinilai ? (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md font-semibold">
          Sudah dinilai
        </div>
      ) : (
        <form onSubmit={handleSubmitGrade} className="mt-4 space-y-2">
          <div>
            <label className="text-sm font-medium">Nilai:</label>
            <input
              type="number"
              value={nilai}
              onChange={(e) => setNilai(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Masukkan nilai (0-100)"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Feedback:</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="3"
              className="w-full p-2 border rounded mt-1"
              placeholder="Tuliskan feedback untuk siswa..."
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Penilaian"}
          </button>
        </form>
      )}
    </div>
  );
};

// Komponen Utama Halaman
export default function GradingPage() {
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id: assignmentId } = params;

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Penilaian Tugas</h1>
      {/* Nanti bisa ditambahkan judul tugasnya di sini jika data assignment diambil */}

      <div className="space-y-6">
        {submissions.length > 0 ? (
          submissions.map((sub) => (
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
  );
}
