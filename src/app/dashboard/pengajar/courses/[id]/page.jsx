"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
// --- Komponen Ikon Sederhana ---
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const LinkIcon = () => <span>🔗</span>;

// --- Komponen Form untuk Materi ---
const MaterialForm = ({ courseId, onFormSubmit, existingData, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const mode = existingData ? "edit" : "add";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);
    const url =
      mode === "add"
        ? "/api/materials"
        : `/api/materials/${existingData.material_id}`;
    const method = mode === "add" ? "POST" : "PUT";

    let body;
    let headers = {};
    if (mode === "edit") {
      body = JSON.stringify({
        judul_materi: formData.get("judul_materi"),
        deskripsi: formData.get("deskripsi"),
      });
      headers["Content-Type"] = "application/json";
    } else {
      formData.append("id_course", courseId);
      body = formData;
    }

    try {
      const response = await fetch(url, { method, headers, body });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan materi");
      }
      alert(
        mode === "add"
          ? "Materi berhasil diunggah!"
          : "Materi berhasil diperbarui!"
      );
      onFormSubmit();
      e.target.reset();
      if (onCancel) onCancel();
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
      <h3 className="text-lg font-semibold mb-2">
        {mode === "add" ? "Tambah Materi Baru" : "Edit Materi"}
      </h3>
      <div className="mb-2">
        <label htmlFor="judul_materi" className="block text-sm font-medium">
          Judul Materi
        </label>
        <input
          type="text"
          name="judul_materi"
          defaultValue={existingData?.judul_materi || ""}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="deskripsi" className="block text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          name="deskripsi"
          defaultValue={existingData?.deskripsi || ""}
          rows="2"
          className="w-full p-2 border rounded"
        ></textarea>
      </div>
      {mode === "add" && (
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium">
            Pilih File Materi
          </label>
          <input
            type="file"
            name="file"
            required
            className="w-full p-2 border rounded bg-white"
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-4 py-2 rounded-md"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? "Menyimpan..." : "Simpan Materi"}
        </button>
      </div>
    </form>
  );
};

// --- Komponen Form untuk Tugas ---
const AssignmentForm = ({ courseId, onFormSubmit, existingData, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const mode = existingData ? "edit" : "add";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    const url =
      mode === "add"
        ? "/api/assignments"
        : `/api/assignments/${existingData.assignment_id}`;
    const method = mode === "add" ? "POST" : "PUT";

    let body;
    let headers = {};
    if (mode === "edit") {
      body = JSON.stringify({
        judul_tugas: formData.get("judul_tugas"),
        instruksi: formData.get("instruksi"),
      });
      headers["Content-Type"] = "application/json";
    } else {
      formData.append("id_course", courseId);
      body = formData;
    }

    try {
      const response = await fetch(url, { method, headers, body });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan tugas");
      }
      alert(
        mode === "add" ? "Tugas berhasil dibuat!" : "Tugas berhasil diperbarui!"
      );
      onFormSubmit();
      e.target.reset();
      if (onCancel) onCancel();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg bg-gray-50 mt-6"
    >
      <h3 className="text-lg font-semibold mb-2">
        {mode === "add" ? "Tambah Tugas Baru" : "Edit Tugas"}
      </h3>
      <div className="mb-2">
        <label htmlFor="judul_tugas" className="block text-sm font-medium">
          Judul Tugas
        </label>
        <input
          type="text"
          name="judul_tugas"
          defaultValue={existingData?.judul_tugas || ""}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="instruksi" className="block text-sm font-medium">
          Instruksi
        </label>
        <textarea
          name="instruksi"
          defaultValue={existingData?.instruksi || ""}
          rows="3"
          className="w-full p-2 border rounded"
        ></textarea>
      </div>
      {mode === "add" && (
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium">
            Pilih File Soal
          </label>
          <input
            type="file"
            name="file"
            required
            className="w-full p-2 border rounded bg-white"
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-4 py-2 rounded-md"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {submitting ? "Menyimpan..." : "Simpan Tugas"}
        </button>
      </div>
    </form>
  );
};

// --- Komponen Utama Halaman ---
export default function CourseDetailPage() {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("materi");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const params = useParams();
  const { id: courseId } = params;

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, materialsRes, assignmentsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/materials`),
        fetch(`/api/assignments?courseId=${courseId}`),
      ]);
      const courseData = await courseRes.json();
      const supabase = await createSupabaseBrowserClient();
      let materialsData = await materialsRes.json();
      let assignmentsData = await assignmentsRes.json();

      setCourse(courseData.data);

      // Ambil URL publik untuk setiap materi
      if (materialsData.data) {
        const materialsWithUrls = await Promise.all(
          materialsData.data.map(async (m) => {
            const { data } = await supabase.storage
              .from("lms-file")
              .createSignedUrl(m.file_path, 60 * 60); // expired dalam 1 jam
            return { ...m, publicUrl: data?.signedUrl };
          })
        );
        setMaterials(materialsWithUrls);
      }

      // Ambil URL publik untuk setiap tugas
      if (assignmentsData.data) {
        const assignmentsWithUrls = await Promise.all(
          assignmentsData.data.map(async (a) => {
            const { data } = await supabase.storage
              .from("lms-file")
              .createSignedUrl(a.file_path, 60 * 60); // expired dalam 1 jam
            return { ...a, publicUrl: data?.signedUrl };
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

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      try {
        const response = await fetch(`/api/materials/${materialId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Gagal menghapus materi");
        alert("Materi berhasil dihapus");
        fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Gagal menghapus tugas");
        alert("Tugas berhasil dihapus");
        fetchData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

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
            Tugas & Penilaian
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
                  <div
                    key={m.material_id}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <a
                      href={m.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow"
                    >
                      <p className="font-semibold text-blue-600 hover:underline">
                        {m.judul_materi}
                      </p>
                      <p className="text-sm text-gray-500">{m.deskripsi}</p>
                    </a>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingMaterial(m)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(m.material_id)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Hapus"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada materi.</p>
              )}
            </div>
            {editingMaterial ? (
              <MaterialForm
                courseId={courseId}
                onFormSubmit={() => {
                  fetchData();
                  setEditingMaterial(null);
                }}
                existingData={editingMaterial}
                onCancel={() => setEditingMaterial(null)}
              />
            ) : (
              <MaterialForm courseId={courseId} onFormSubmit={fetchData} />
            )}
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
                    <Link
                      href={`/dashboard/pengajar/assignments/${a.assignment_id}`}
                      className="flex-grow"
                    >
                      <p className="font-semibold text-blue-600 hover:underline">
                        {a.judul_tugas}
                      </p>
                      <p className="text-sm text-gray-500">{a.instruksi}</p>
                    </Link>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingAssignment(a)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(a.assignment_id)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Hapus"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada tugas.</p>
              )}
            </div>
            {editingAssignment ? (
              <AssignmentForm
                courseId={courseId}
                onFormSubmit={() => {
                  fetchData();
                  setEditingAssignment(null);
                }}
                existingData={editingAssignment}
                onCancel={() => setEditingAssignment(null)}
              />
            ) : (
              <AssignmentForm courseId={courseId} onFormSubmit={fetchData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
