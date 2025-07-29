"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AssignmentSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = await createSupabaseBrowserClient();
      // Ambil data submissions beserta relasi user dan assignment
      const { data, error } = await supabase
        .from("submissions")
        .select(`submission_id, id_assignment, id_siswa, file_path, submitted_at, nilai, feedback, users(nama_lengkap), assignments(judul_tugas)`);
      setSubmissions(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDownload = async (filePath) => {
    let cleanPath = filePath;
    if (filePath.startsWith("/")) cleanPath = filePath.slice(1);
    const supabase = await createSupabaseBrowserClient();
    const { data, error } = await supabase.storage.from("lms-file").createSignedUrl(cleanPath, 60 * 60);
    if (error || !data?.signedUrl) {
      alert("Gagal membuat signed URL untuk file.");
      return;
    }
    // Ambil nama file dari path
    const fileName = cleanPath.split("/").pop() || "file";
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Penilaian Semua Tugas</h1>
      {loading ? (
        <p>Memuat data submissions...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Nama Siswa</th>
                <th className="p-2">Judul Tugas</th>
                <th className="p-2">Waktu Submit</th>
                <th className="p-2">Nilai</th>
                <th className="p-2">Feedback</th>
                <th className="p-2">Status</th>
                <th className="p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((s) => {
                  const sudahDinilai = s.nilai !== null && s.feedback !== null && s.nilai !== "";
                  return (
                    <tr key={s.submission_id} className="border-t">
                      <td className="p-2">{s.users?.nama_lengkap || s.id_siswa}</td>
                      <td className="p-2">{s.assignments?.judul_tugas || s.id_assignment}</td>
                      <td className="p-2">{new Date(s.submitted_at).toLocaleString()}</td>
                      <td className="p-2">{s.nilai ?? '-'}</td>
                      <td className="p-2">{s.feedback ?? '-'}</td>
                      <td className="p-2 font-semibold">
                        {sudahDinilai ? (
                          <span className="text-green-600">Sudah dinilai</span>
                        ) : (
                          <span className="text-yellow-600">Belum dinilai</span>
                        )}
                      </td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleDownload(s.file_path)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                        >
                          Download
                        </button>
                        <Link href={`/dashboard/pengajar/assignments/${s.id_assignment}`}>
                          <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                            Nilai
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    Belum ada submission.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
