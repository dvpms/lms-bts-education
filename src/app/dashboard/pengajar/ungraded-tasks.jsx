"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";

export default function UngradedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUngraded = async () => {
      setLoading(true);
      setError("");
      try {
        // Ganti endpoint sesuai API yang sudah ada, misal /api/assignments/ungraded
        const res = await fetch("/api/assignments/ungraded");
        if (!res.ok) throw new Error("Gagal mengambil data tugas belum dinilai");
        const data = await res.json();
        setTasks(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUngraded();
  }, []);

  if (loading) return <div className="mb-6">Memuat pemberitahuan tugas...</div>;
  if (error) return <div className="mb-6 text-red-500">{error}</div>;
  if (tasks.length === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6 flex items-start gap-3">
      <FiAlertCircle className="text-yellow-500 text-2xl mt-1" />
      <div>
        <div className="font-semibold text-yellow-800 mb-1">Tugas Belum Dinilai</div>
        <ul className="list-disc ml-5 text-sm">
          {tasks.map((t) => (
            <li key={t.id}>
              <Link href={`/dashboard/pengajar/assignments/${t.assignment_id}`} className="underline text-blue-700 hover:text-blue-900">
                {t.assignment_judul || "Tugas"}
              </Link>{" "}
              dari <span className="font-medium">{t.siswa_nama || "Siswa"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
