
"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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
      await Swal.fire({
        icon: "success",
        title: mode === "add" ? "Tugas berhasil dibuat!" : "Tugas berhasil diperbarui!",
        showConfirmButton: false,
        timer: 1500,
      });
      onFormSubmit();
      e.target.reset();
      if (onCancel) onCancel();
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
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="task-title" className="block text-sm font-semibold text-gray-700 mb-1">
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
        <label htmlFor="task-instruction" className="block text-sm font-semibold text-gray-700 mb-1">
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
        <label htmlFor="task-file" className="block text-sm font-semibold text-gray-700 mb-1">
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

export default AssignmentForm;
