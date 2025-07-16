"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Komponen untuk Form Unggah Jawaban
const SubmissionForm = ({ assignmentId, onSubmissionSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Silakan pilih file untuk diunggah.");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_assignment", assignmentId);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal mengumpulkan tugas");
      }

      alert("Tugas berhasil dikumpulkan!");
      onSubmissionSuccess();
      e.target.reset();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg bg-gray-50 mt-6"
    >
      <h3 className="text-lg font-semibold mb-2">Unggah Jawaban Anda</h3>
      <div className="mb-4">
        <label htmlFor="file_jawaban" className="block text-sm font-medium">
          Pilih File Jawaban
        </label>
        <input
          type="file"
          id="file_jawaban"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="w-full p-2 border rounded bg-white"
        />
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Mengunggah..." : "Kumpulkan Tugas"}
      </button>
    </form>
  );
};

// Komponen Utama Halaman

export default function StudentAssignmentPage() {
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicUrl, setPublicUrl] = useState("");
  const params = useParams();
  const { id: assignmentId } = params;

  const fetchData = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    try {
      // API ini perlu kita buat untuk mengambil detail satu tugas
      const assignmentRes = await fetch(`/api/assignments/${assignmentId}`);
      const assignmentData = await assignmentRes.json();
      setAssignment(assignmentData.data);

      // Ambil signedUrl file soal jika ada (lebih aman)
      if (assignmentData.data?.file_path) {
        const supabase = await createSupabaseBrowserClient();
        const { data, error } = await supabase.storage
          .from("lms-file")
          .createSignedUrl(assignmentData.data.file_path, 60 * 60); // expired 1 jam
        setPublicUrl(data?.signedUrl || "");
      } else {
        setPublicUrl("");
      }

      // API ini perlu kita buat untuk memeriksa apakah siswa sudah pernah submit
      const submissionRes = await fetch(
        `/api/submissions/check?assignmentId=${assignmentId}`
      );
      const submissionData = await submissionRes.json();
      setSubmission(submissionData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Memuat detail tugas...</div>;
  if (!assignment) return <div>Tugas tidak ditemukan.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{assignment.judul_tugas}</h1>
      <p className="text-gray-600 mb-6">{assignment.instruksi}</p>

      {publicUrl && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-6"
        >
          Unduh File Soal
        </a>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Status Pengumpulan</h2>
        {submission ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            <p className="font-semibold">
              Anda sudah mengumpulkan tugas ini pada:
            </p>
            <p>{new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
        ) : (
          <SubmissionForm
            assignmentId={assignmentId}
            onSubmissionSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
}
