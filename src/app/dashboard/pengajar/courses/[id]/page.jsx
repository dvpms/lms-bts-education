"use client";

import { FiArrowLeft, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";
import MaterialForm from "./components/MaterialForm";
import AssignmentForm from "./components/AssignmentForm";
import AddEnrollmentForm from "./components/AddEnrollmentForm";
import TabMaterials from "./components/TabMaterials";
import TabAssignments from "./components/TabAssignments";
import TabEnrollments from "./components/TabEnrollments";

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
      judul_materi: "Unit 1 - Pengenalan JavaScript (dummy)",
      deskripsi: "Dasar-dasar JavaScript untuk pemula",
      file_path: "/dummy/materials/1-pengenalan-javascript.pdf",
    },
    {
      material_id: "dummy-2",
      judul_materi: "Unit 2 - Variabel & Tipe Data (dummy)",
      deskripsi: "Penjelasan variabel dan tipe data",
      file_path: "/dummy/materials/2-variabel-tipe-data.pdf",
    },
    {
      material_id: "dummy-3",
      judul_materi: "Unit 3 - Fungsi (dummy)",
      deskripsi: "Membuat dan menggunakan fungsi",
      file_path: "/dummy/materials/3-fungsi.pdf",
    },
  ];

  const dummyAssignments = [
    {
      assignment_id: "dummy-1",
      judul_tugas: "Tugas 1 - Membuat Variabel (dummy)",
      instruksi: "Buat 3 variabel berbeda dan tampilkan di console.",
    },
    {
      assignment_id: "dummy-2",
      judul_tugas: "Tugas 2 - Fungsi Penjumlahan (dummy)",
      instruksi: "Buat fungsi untuk menjumlahkan dua angka.",
    },
    {
      assignment_id: "dummy-3",
      judul_tugas: "Tugas 3 - Array Mahasiswa (dummy)",
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

  // Gabungkan data dari database dan dummy (data dari database diurutkan lebih dulu)
  const displayMaterials = [
    ...materials,
    ...dummyMaterials.filter(
      (dm) => !materials.some((m) => m.material_id === dm.material_id)
    ),
  ];

  // State untuk signedUrl per material
  const [materialSignedUrls, setMaterialSignedUrls] = useState({});

  // Generate signedUrl hanya untuk file_path yang bukan dummy dan hanya untuk materials dari database
  useEffect(() => {
    const fetchSignedUrls = async () => {
      const supabase = await createSupabaseBrowserClient();
      const newUrls = {};
      await Promise.all(
        materials.map(async (m) => {
          if (m.file_path && !m.file_path.startsWith("/dummy/")) {
            try {
              const { data, error } = await supabase.storage
                .from("lms-file")
                .createSignedUrl(m.file_path, 60 * 60);
              if (data?.signedUrl) {
                newUrls[m.material_id] = data.signedUrl;
              }
            } catch (e) {}
          }
        })
      );
      setMaterialSignedUrls(newUrls);
    };
    fetchSignedUrls();
  }, [materials]);
  const displayAssignments = [
    ...assignments,
    ...dummyAssignments.filter(
      (da) => !assignments.some((a) => a.assignment_id === da.assignment_id)
    ),
  ];

  // State untuk signedUrl per assignment
  const [assignmentSignedUrls, setAssignmentSignedUrls] = useState({});

  // Generate signedUrl hanya untuk file_path yang bukan dummy dan hanya untuk assignments dari database
  useEffect(() => {
    const fetchSignedUrls = async () => {
      const supabase = await createSupabaseBrowserClient();
      const newUrls = {};
      await Promise.all(
        assignments.map(async (a) => {
          if (a.file_path && !a.file_path.startsWith("/dummy/")) {
            try {
              const { data, error } = await supabase.storage
                .from("lms-file")
                .createSignedUrl(a.file_path, 60 * 60);
              if (data?.signedUrl) {
                newUrls[a.assignment_id] = data.signedUrl;
              }
            } catch (e) {}
          }
        })
      );
      setAssignmentSignedUrls(newUrls);
    };
    fetchSignedUrls();
  }, [assignments]);
  const displayEnrollments = [
    ...enrollments,
    ...dummyEnrollments.filter(
      (de) => !enrollments.some((e) => e.enrollment_id === de.enrollment_id)
    ),
  ];

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
            Kelola Tugas
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
          <TabMaterials
            displayMaterials={displayMaterials}
            materialSignedUrls={materialSignedUrls}
            setEditingMaterial={setEditingMaterial}
            setShowMaterialModal={setShowMaterialModal}
            handleDeleteMaterial={handleDeleteMaterial}
            showMaterialModal={showMaterialModal}
            editingMaterial={editingMaterial}
            courseId={courseId}
            fetchData={fetchData}
          />
        )}

        {activeTab === "tugas" && (
          <TabAssignments
            displayAssignments={displayAssignments}
            setEditingAssignment={setEditingAssignment}
            setShowTaskModal={setShowTaskModal}
            handleDeleteAssignment={handleDeleteAssignment}
            showTaskModal={showTaskModal}
            editingAssignment={editingAssignment}
            courseId={courseId}
            fetchData={fetchData}
            assignmentSignedUrls={assignmentSignedUrls}
          />
        )}

        {/* Modal Tambah/Edit Materi */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 modal-transition">
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
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 modal-transition">
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
          <TabEnrollments
            displayEnrollments={displayEnrollments}
            handleRemoveEnrollment={handleRemoveEnrollment}
            courseId={courseId}
            fetchEnrollments={fetchEnrollments}
            allStudents={allStudents}
            loadingStudents={loadingStudents}
          />
        )}
      </div>
    </div>
  );
}
