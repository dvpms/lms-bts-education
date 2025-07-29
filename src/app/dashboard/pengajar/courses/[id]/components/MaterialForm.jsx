"use client";
import { useState } from "react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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
      await Swal.fire({
        icon: "success",
        title: mode === "add" ? "Materi berhasil diunggah!" : "Materi berhasil diperbarui!",
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
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="material-title" className="block text-sm font-semibold text-gray-700 mb-1">
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
        <label htmlFor="material-file" className="block text-sm font-semibold text-gray-700 mb-1">
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

export default MaterialForm;
