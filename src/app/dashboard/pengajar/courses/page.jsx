"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Ganti dengan komponen ikon yang sesuai dari library seperti react-icons
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const PlusIcon = () => <span>+</span>;

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal (tambah/edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' atau 'edit'
  const [currentCourse, setCurrentCourse] = useState(null);

  const router = useRouter();

  // Fungsi untuk mengambil data kursus
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) {
        // Jika respons error, coba tangani sebagai teks dulu
        const errorText = await response.text();
        console.error("Gagal mengambil data kursus:", errorText);
        // Mungkin ada error otentikasi yang mengembalikan halaman HTML
        if (errorText.includes("<!DOCTYPE html>")) {
          alert("Sesi Anda mungkin telah berakhir. Silakan login kembali.");
          router.push("/login");
        }
        return;
      }
      const data = await response.json();
      setCourses(data.data);
    } catch (error) {
      console.error("Terjadi error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mengambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fungsi untuk menangani submit form (tambah/edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const courseData = {
      nama_course: formData.get("nama_course"),
      deskripsi: formData.get("deskripsi"),
    };

    const url =
      modalMode === "add"
        ? "/api/courses"
        : `/api/courses/${currentCourse.course_id}`;
    const method = modalMode === "add" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchCourses(); // Muat ulang data
      } else {
        const errorData = await response.json();
        alert(`Gagal menyimpan data: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Terjadi error: ${error.message}`);
    }
  };

  // Fungsi untuk menghapus kursus
  const handleDelete = async (courseId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus kursus ini? Semua materi dan tugas di dalamnya juga akan terhapus."
      )
    ) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchCourses(); // Muat ulang data
        } else {
          const errorData = await response.json();
          alert(`Gagal menghapus kursus: ${errorData.message}`);
        }
      } catch (error) {
        alert(`Terjadi error: ${error.message}`);
      }
    }
  };

  // Fungsi untuk navigasi ke detail kursus
  const handleCourseClick = (courseId) => {
    // Arahkan ke halaman detail materi dan tugas untuk kursus ini
    router.push(`/dashboard/pengajar/courses/${courseId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kursus Saya</h1>
        <button
          onClick={() => {
            setModalMode("add");
            setCurrentCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          <PlusIcon />
          <span className="ml-2">Tambah Kursus Baru</span>
        </button>
      </div>

      {loading ? (
        <p>Memuat data kursus...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses &&
            courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleCourseClick(course.course_id)}
                >
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {course.nama_course}
                  </h2>
                  <p className="text-gray-600 text-sm">{course.deskripsi}</p>
                </div>
                <div className="flex justify-end items-center mt-4">
                  <button
                    onClick={() => {
                      setModalMode("edit");
                      setCurrentCourse(course);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full"
                    title="Edit Kursus"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(course.course_id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full ml-2"
                    title="Hapus Kursus"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal untuk Tambah/Edit Kursus */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">
              {modalMode === "add" ? "Tambah Kursus Baru" : "Edit Kursus"}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="nama_course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama Kursus
                </label>
                <input
                  type="text"
                  name="nama_course"
                  id="nama_course"
                  defaultValue={currentCourse?.nama_course || ""}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="deskripsi"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  id="deskripsi"
                  rows="4"
                  defaultValue={currentCourse?.deskripsi || ""}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
