"use client";

import { BsDownload } from "react-icons/bs";
import { FiEdit2, FiTrash2, FiPlusCircle, FiX } from "react-icons/fi";
import MaterialForm from "./MaterialForm";
import { useState } from "react";
const TabMaterials = ({
  displayMaterials,
  materialSignedUrls,
  setEditingMaterial,
  setShowMaterialModal,
  handleDeleteMaterial,
  showMaterialModal,
  editingMaterial,
  courseId,
  fetchData,
}) => {
  return (
    <div id="materi-content" className="tab-content">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Daftar Materi</h3>
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
              <p className="font-semibold text-gray-800">{m.judul_materi}</p>
              <p className="text-sm text-gray-500">{m.deskripsi || "File Materi"}</p>
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
              {m.file_path && materialSignedUrls[m.material_id] && (
                <a
                  href={materialSignedUrls[m.material_id]}
                  className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1"
                  rel="noopener noreferrer"
                  download
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
    </div>
  );
};

export default TabMaterials;
