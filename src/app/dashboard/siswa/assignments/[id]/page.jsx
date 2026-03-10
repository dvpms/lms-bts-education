"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FiArrowLeft, FiDownload, FiUpload, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";

// Komponen untuk Form Unggah Jawaban
const SubmissionForm = ({ assignmentId, onSubmissionSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    document.getElementById("file_jawaban").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      await Swal.fire({
        icon: "warning",
        title: "Pilih file terlebih dahulu",
        text: "Silakan pilih file untuk diunggah.",
      });
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
      await Swal.fire({
        icon: "success",
        title: "Tugas berhasil dikumpulkan!",
        showConfirmButton: false,
        timer: 1500,
      });
      onSubmissionSuccess();
      setFile(null);
      e.target.reset();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Gagal mengumpulkan tugas",
        text: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-dashed rounded-lg bg-slate-50 text-center">
      <FiUpload className="mx-auto text-5xl text-gray-400" />
      <h4 className="mt-4 text-lg font-semibold text-gray-800">Unggah File Jawaban Anda</h4>
      <p className="text-sm text-gray-500 mt-1">Seret & lepas file Anda di sini, atau klik untuk memilih.</p>
      <input
        type="file"
        id="file_jawaban"
        className="hidden"
        onChange={handleFileChange}
        required
      />
      <button
        type="button"
        className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 font-semibold"
        onClick={handleButtonClick}
        disabled={uploading}
      >
        Pilih File
      </button>
      {file && (
        <div className="mt-2 text-sm text-gray-700">File dipilih: <span className="font-semibold">{file.name}</span></div>
      )}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-fit mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
        >
          {uploading ? "Mengunggah..." : "Kumpulkan Tugas"}
        </button>
      </div>
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
  const router = useRouter();
  const { id: assignmentId } = params;

  const fetchData = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    try {
      const assignmentRes = await fetch(`/api/assignments/${assignmentId}`);
      const assignmentData = await assignmentRes.json();
      setAssignment(assignmentData.data);
      if (assignmentData.data?.file_path) {
        const supabase = await createSupabaseBrowserClient();
        const { data, error } = await supabase.storage
          .from("lms-file")
          .createSignedUrl(assignmentData.data.file_path, 60 * 60, { download: true });
        setPublicUrl(data?.signedUrl || "");
      } else {
        setPublicUrl("");
      }
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
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">{assignment.judul_tugas}</h2>
        <p className="text-gray-500 mt-2 max-w-2xl">{assignment.instruksi}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Detail Tugas</h3>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-semibold"
            >
              <FiDownload />
              <span>Unduh File Soal</span>
            </a>
          )}
        </div>
        <div className="space-y-6">
          {/* Status Pengumpulan */}
          {submission ? (
            submission.status === "Revisi" ? (
              <div className="p-6 bg-yellow-100 text-yellow-900 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FiUpload className="text-3xl" />
                  <div>
                    <h4 className="font-bold">Tugas Perlu Revisi</h4>
                    <p className="text-sm">Silakan baca feedback dan upload ulang file tugas Anda.</p>
                  </div>
                </div>
                {submission.feedback && (
                  <div className="mb-2">
                    <span className="font-semibold">Feedback Pengajar:</span>
                    <div className="bg-white border border-yellow-300 rounded p-2 mt-1 text-sm">{submission.feedback}</div>
                  </div>
                )}
                <SubmissionForm
                  assignmentId={assignmentId}
                  onSubmissionSuccess={fetchData}
                />
                <div className="text-xs text-gray-500 mt-2">Terakhir upload: {new Date(submission.submitted_at).toLocaleString()}</div>
              </div>
            ) : (
              <div className="p-6 bg-green-100 text-green-800 rounded-lg flex items-center gap-4">
                <FiCheckCircle className="text-3xl" />
                <div>
                  <h4 className="font-bold">Tugas Berhasil Dikumpulkan!</h4>
                  <p className="text-sm">Anda mengumpulkan tugas ini pada {new Date(submission.submitted_at).toLocaleString()}.</p>
                  {submission.status && (
                    <div className="mt-1 text-xs text-gray-700">Status: <span className="font-bold">{submission.status}</span></div>
                  )}
                  {submission.feedback && (
                    <div className="mt-1 text-xs text-gray-700">Feedback: {submission.feedback}</div>
                  )}
                </div>
              </div>
            )
          ) : (
            <SubmissionForm
              assignmentId={assignmentId}
              onSubmissionSuccess={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
