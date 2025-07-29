"use client";
import { useState } from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const AddEnrollmentForm = ({ courseId, onEnrollmentAdded, allStudents, loadingStudents }) => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      await Swal.fire({
        icon: "warning",
        title: "Pilih siswa",
        text: "Silakan pilih siswa untuk didaftarkan.",
      });
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
      await Swal.fire({
        icon: "success",
        title: "Siswa berhasil didaftarkan!",
        showConfirmButton: false,
        timer: 1500,
      });
      onEnrollmentAdded();
      setSelectedStudent("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-4 mb-8 border-b pb-6">
      <div className="flex-grow">
        <label htmlFor="student-select" className="block text-sm font-semibold text-gray-700 mb-1">
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
            {loadingStudents ? "Memuat siswa..." : "-- Pilih dari daftar siswa --"}
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

export default AddEnrollmentForm;
