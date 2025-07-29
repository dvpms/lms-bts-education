
"use client";


import { FiArrowLeft, FiPlusCircle, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
import { BsDownload } from "react-icons/bs";
import { HiOutlineEye } from "react-icons/hi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";

// --- Modal Forms ---
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
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="material-title"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Judul Materi
        </label>
        <input
          type="text"
          id="material-title"
          name="judul_materi"
          required
          defaultValue={existingData?.judul_materi || ""}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Contoh: Unit 3 - Functions"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="material-file"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          File Materi
        </label>
        <input
          type="file"
          id="material-file"
          name="file"
          required={mode === "add"}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          {uploading
            ? "Menyimpan..."
            : mode === "add"
            ? "Unggah Materi"
            : "Simpan Materi"}
        </button>
      </div>
    </form>
  );
};

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
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="task-title"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Judul Tugas
        </label>
        <input
          type="text"
          id="task-title"
          name="judul_tugas"
          required
          defaultValue={existingData?.judul_tugas || ""}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Contoh: Latihan Kalkulator"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="task-instruction"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Instruksi
        </label>
        <textarea
          id="task-instruction"
          name="instruksi"
          rows="3"
          defaultValue={existingData?.instruksi || ""}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          placeholder="Jelaskan instruksi tugas di sini..."
        ></textarea>
      </div>
      <div className="mb-6">
        <label
          htmlFor="task-file"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          File Soal (Opsional)
        </label>
        <input
          type="file"
          id="task-file"
          name="file"
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          {submitting
            ? "Menyimpan..."
            : mode === "add"
            ? "Simpan Tugas"
            : "Update Tugas"}
        </button>
      </div>
    </form>
  );
};
const AddEnrollmentForm = ({
  courseId,
  onEnrollmentAdded,
  allStudents,
  loadingStudents,
}) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Silakan pilih siswa untuk didaftarkan.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_course: courseId,
          id_siswa: selectedStudent,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mendaftarkan siswa");
      }
      alert("Siswa berhasil didaftarkan!");
      onEnrollmentAdded();
      setSelectedStudent("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-4 mt-8 border-t pt-6"
    >
      <div className="flex-grow">
        <label
          htmlFor="student-select"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Pilih Siswa
        </label>
        <select
          id="student-select"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          disabled={loadingStudents}
        >
          <option value="">
            {loadingStudents
              ? "Memuat siswa..."
              : "-- Pilih dari daftar siswa --"}
          </option>
          {!loadingStudents &&
            allStudents.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.nama_lengkap} ({s.email})
              </option>
            ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
      >
        {submitting ? "Mendaftarkan..." : "Daftarkan"}
      </button>
    </form>
  );
};

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState("materi");
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const params = useParams();
  const { id: courseId } = params;

  // Fetch course, materials, assignments
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
      let materialsData = await materialsRes.json();
      let assignmentsData = await assignmentsRes.json();
      setCourse(courseData.data);
      setMaterials(materialsData.data || []);
      setAssignments(assignmentsData.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    setLoadingEnrollments(true);
    try {
      const res = await fetch(`/api/enrollments?courseId=${courseId}`);
      const data = await res.json();
      setEnrollments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [courseId]);

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/users?role=siswa");
      const data = await res.json();
      setAllStudents(data.data || []);
    } catch (error) {
      setAllStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Dummy data for presentation
  const dummyMaterials = [
    {
      material_id: "dummy-1",
      judul_materi: "Unit 1 - Pengenalan JavaScript",
      deskripsi: "Dasar-dasar JavaScript untuk pemula",
      publicUrl: "#",
    },
    {
      material_id: "dummy-2",
      judul_materi: "Unit 2 - Variabel & Tipe Data",
      deskripsi: "Penjelasan variabel dan tipe data",
      publicUrl: "#",
    },
    {
      material_id: "dummy-3",
      judul_materi: "Unit 3 - Fungsi",
      deskripsi: "Membuat dan menggunakan fungsi",
      publicUrl: "#",
    },
  ];

  const dummyAssignments = [
    {
      assignment_id: "dummy-1",
      judul_tugas: "Tugas 1 - Membuat Variabel",
      instruksi: "Buat 3 variabel berbeda dan tampilkan di console.",
    },
    {
      assignment_id: "dummy-2",
      judul_tugas: "Tugas 2 - Fungsi Penjumlahan",
      instruksi: "Buat fungsi untuk menjumlahkan dua angka.",
    },
    {
      assignment_id: "dummy-3",
      judul_tugas: "Tugas 3 - Array Mahasiswa",
      instruksi: "Buat array berisi nama mahasiswa dan tampilkan.",
    },
  ];

  // Dummy students for presentation
  const dummyEnrollments = [
    {
      enrollment_id: "dummy-1",
      users: { nama_lengkap: "Budi Santoso", email: "budi.siswa@example.com" },
    },
    {
      enrollment_id: "dummy-2",
      users: { nama_lengkap: "Siti Aminah", email: "siti.aminah@example.com" },
    },
    {
      enrollment_id: "dummy-3",
      users: {
        nama_lengkap: "Rizky Pratama",
        email: "rizky.pratama@example.com",
      },
    },
  ];

  // Always show dummy data for presentation
  const displayMaterials = dummyMaterials;
  const displayAssignments = dummyAssignments;
  const displayEnrollments = dummyEnrollments;

  useEffect(() => {
    fetchData();
    fetchEnrollments();
    fetchStudents();
  }, [fetchData, fetchEnrollments, fetchStudents]);

  // Remove student from course
  const handleRemoveEnrollment = async (enrollmentId) => {
    const result = await Swal.fire({
      title: "Keluarkan siswa?",
      text: "Keluarkan siswa dari kursus ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, keluarkan",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal mengeluarkan siswa");
      await Swal.fire("Berhasil!", "Siswa dikeluarkan dari kursus.", "success");
      fetchEnrollments();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (materialId) => {
    const result = await Swal.fire({
      title: "Hapus materi?",
      text: "Apakah Anda yakin ingin menghapus materi ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus materi");
      await Swal.fire("Berhasil!", "Materi berhasil dihapus.", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (assignmentId) => {
    const result = await Swal.fire({
      title: "Hapus tugas?",
      text: "Apakah Anda yakin ingin menghapus tugas ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus tugas");
      await Swal.fire("Berhasil!", "Tugas berhasil dihapus.", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  if (loading) return <div>Memuat data detail kursus...</div>;
  if (!course) return <div>Kursus tidak ditemukan.</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/pengajar/courses"
          className="text-sm text-green-600 hover:underline flex items-center gap-2 mb-4"
        >
          <FiArrowLeft />
          Kembali ke Kelola Kursus
        </Link>
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          {course.nama_course}
        </h2>
        <p className="text-gray-500 mt-2 max-w-2xl">{course.deskripsi}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav id="tabs" className="-mb-px flex gap-6" aria-label="Tabs">
          <button
            className={`tab-btn py-4 px-1 border-b-2 font-semibold text-base ${
              activeTab === "materi"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("materi")}
          >
            Materi Pembelajaran
          </button>
          <button
            className={`tab-btn py-4 px-1 border-b-2 font-medium text-base ${
              activeTab === "tugas"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("tugas")}
          >
            Tugas & Penilaian
          </button>
          <button
            className={`tab-btn py-4 px-1 border-b-2 font-medium text-base ${
              activeTab === "peserta"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("peserta")}
          >
            Kelola Peserta
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-8">
        {/* Materi Tab */}

        {activeTab === "materi" && (
          <div id="materi-content" className="tab-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Daftar Materi
              </h3>
              <button
                id="add-material-btn"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
                onClick={() => {
                  setEditingMaterial(null);
                  setShowMaterialModal(true);
                }}
              >
                <FiPlusCircle />
                <span>Tambah Materi</span>
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              {displayMaterials.map((m) => (
                <div
                  key={m.material_id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {m.judul_materi}
                    </p>
                    <p className="text-sm text-gray-500">
                      {m.deskripsi || "File Materi"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                      title="Edit"
                      onClick={() => {
                        setEditingMaterial(m);
                        setShowMaterialModal(true);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"
                      title="Hapus"
                      onClick={() => handleDeleteMaterial(m.material_id)}
                    >
                      <FiTrash2 />
                    </button>
                    {m.publicUrl && (
                      <a
                        href={m.publicUrl}
                        className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Unduh"
                      >
                        <BsDownload />
                        Unduh
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tugas" && (
          <div id="tugas-content" className="tab-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Daftar Tugas</h3>
              <button
                id="add-task-btn"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md"
                onClick={() => {
                  setEditingAssignment(null);
                  setShowTaskModal(true);
                }}
              >
                <FiPlusCircle />
                <span>Tambah Tugas</span>
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              {displayAssignments.map((a) => (
                <div
                  key={a.assignment_id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.judul_tugas}
                    </p>
                    <p className="text-sm text-gray-500">
                      {a.instruksi || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Tampilkan tombol edit dan hapus untuk semua data, termasuk dummy */}
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                      title="Edit"
                      onClick={() => {
                        setEditingAssignment(a);
                        setShowTaskModal(true);
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"
                      title="Hapus"
                      onClick={() => handleDeleteAssignment(a.assignment_id)}
                    >
                      <FiTrash2 />
                    </button>
                    <Link
                      href={`/dashboard/pengajar/assignments/${a.assignment_id}`}
                      className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1"
                      title="Lihat Pengumpulan"
                    >
                      <HiOutlineEye />
                      Lihat Pengumpulan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Tambah/Edit Materi */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 modal-transition">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transform modal-transition">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingMaterial ? "Edit Materi" : "Tambah Materi Baru"}
                </h2>
                <button
                  onClick={() => setShowMaterialModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  title="Tutup"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <MaterialForm
                courseId={courseId}
                onFormSubmit={() => {
                  setShowMaterialModal(false);
                  setEditingMaterial(null);
                  fetchData();
                }}
                existingData={editingMaterial}
                onCancel={() => {
                  setShowMaterialModal(false);
                  setEditingMaterial(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Tambah/Edit Tugas */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 modal-transition">
            <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transform modal-transition">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingAssignment ? "Edit Tugas" : "Tambah Tugas Baru"}
                </h2>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  title="Tutup"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <AssignmentForm
                courseId={courseId}
                onFormSubmit={() => {
                  setShowTaskModal(false);
                  setEditingAssignment(null);
                  fetchData();
                }}
                existingData={editingAssignment}
                onCancel={() => {
                  setShowTaskModal(false);
                  setEditingAssignment(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Peserta Tab */}
        {activeTab === "peserta" && (
          <div id="peserta-content" className="tab-content">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Daftar Siswa Terdaftar
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="space-y-4">
                {displayEnrollments.map((e) => (
                  <div
                    key={e.enrollment_id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <p className="font-semibold text-gray-800">
                      {e.users.nama_lengkap} ({e.users.email})
                    </p>
                    <button
                      className="text-sm font-semibold text-red-600 hover:underline ml-4"
                      title="Keluarkan siswa"
                      onClick={() => handleRemoveEnrollment(e.enrollment_id)}
                    >
                      Keluarkan Siswa
                    </button>
                  </div>
                ))}
              </div>
              <AddEnrollmentForm
                courseId={courseId}
                onEnrollmentAdded={fetchEnrollments}
                allStudents={allStudents}
                loadingStudents={loadingStudents}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
