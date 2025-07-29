
"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlusCircle, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import Swal from "sweetalert2";


export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentCourse, setCurrentCourse] = useState(null);
  const router = useRouter();

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("<!DOCTYPE html>")) {
          alert("Sesi Anda mungkin telah berakhir. Silakan login kembali.");
          router.push("/");
        }
        return;
      }
      const data = await response.json();
      setCourses(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      nama_course: formData.get("nama_course"),
      deskripsi: formData.get("deskripsi"),
    };
    const url = modalMode === "add" ? "/api/courses" : `/api/courses/${currentCourse.course_id}`;
    const method = modalMode === "add" ? "POST" : "PUT";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchCourses();
        await Swal.fire({
          icon: "success",
          title: modalMode === "add" ? "Kursus berhasil ditambahkan!" : "Kursus berhasil diperbarui!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const errorData = await response.json();
        Swal.fire("Gagal", `Gagal menyimpan data: ${errorData.message}`, "error");
      }
    } catch (error) {
      Swal.fire("Error", `Terjadi error: ${error.message}` , "error");
    }
  };

  // Delete
  const handleDelete = async (courseId) => {
    const result = await Swal.fire({
      title: "Hapus Kursus?",
      text: "Apakah Anda yakin ingin menghapus kursus ini? Semua materi dan tugas di dalamnya juga akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
        if (response.ok) {
          await Swal.fire("Berhasil!", "Kursus berhasil dihapus.", "success");
          fetchCourses();
        } else {
          const errorData = await response.json();
          Swal.fire("Gagal", `Gagal menghapus kursus: ${errorData.message}`, "error");
        }
      } catch (error) {
        Swal.fire("Error", `Terjadi error: ${error.message}`, "error");
      }
    }
  };

  // Go to detail
  const handleCourseClick = (courseId) => {
    router.push(`/dashboard/pengajar/courses/${courseId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Kelola Kursus</h2>
          <p className="text-gray-500 mt-1">Buat, edit, dan kelola semua kursus yang Anda ajar.</p>
        </div>
        <button
          id="add-course-btn"
          onClick={() => {
            setModalMode("add");
            setCurrentCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 shadow-lg transition-transform transform hover:scale-105"
        >
          <FiPlusCircle className="text-xl" />
          <span className="font-semibold">Tambah Kursus Baru</span>
        </button>
      </div>

      {/* Daftar Kursus */}
      {loading ? (
        <p>Memuat data kursus...</p>
      ) : (
        <div id="course-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden group">
                <div className="p-6 flex-grow cursor-pointer" onClick={() => handleCourseClick(course.course_id)}>
                  <h3 className="text-lg font-bold text-gray-900">{course.nama_course}</h3>
                  <p className="text-sm text-gray-500 mt-2">{course.deskripsi}</p>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end items-center gap-2">
                  <button
                    className="text-sm font-semibold text-green-600 hover:underline mr-auto"
                    title="Lihat Detail"
                    onClick={() => handleCourseClick(course.course_id)}
                  >
                    Lihat Detail
                  </button>
                  <button
                    className="edit-btn p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                    title="Edit Kursus"
                    onClick={() => {
                      setModalMode("edit");
                      setCurrentCourse(course);
                      setIsModalOpen(true);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="delete-btn p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full"
                    title="Hapus Kursus"
                    onClick={() => handleDelete(course.course_id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-12">Belum ada kursus.</div>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Kursus */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transform">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === "add" ? "Tambah Kursus Baru" : "Edit Kursus"}
              </h2>
              <button
                id="close-modal-btn"
                className="p-2 hover:bg-gray-200 rounded-full"
                onClick={() => setIsModalOpen(false)}
                title="Tutup"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label htmlFor="nama_course" className="block text-sm font-semibold text-gray-700 mb-1">Nama Kursus</label>
                <input
                  type="text"
                  name="nama_course"
                  id="nama_course"
                  required
                  defaultValue={currentCourse?.nama_course || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: Dasar Pemrograman Python"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="deskripsi" className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  name="deskripsi"
                  id="deskripsi"
                  rows={4}
                  defaultValue={currentCourse?.deskripsi || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Jelaskan secara singkat tentang kursus ini..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  id="cancel-btn"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  Simpan Kursus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
