"use client";

import { FiEdit2, FiTrash2, FiPlusCircle, FiX } from "react-icons/fi";
import { HiOutlineEye } from "react-icons/hi";
import { BsDownload } from "react-icons/bs";
import Link from "next/link";
import AssignmentForm from "./AssignmentForm";


const TabAssignments = ({
  displayAssignments,
  setEditingAssignment,
  setShowTaskModal,
  handleDeleteAssignment,
  showTaskModal,
  editingAssignment,
  courseId,
  fetchData,
  assignmentSignedUrls = {},
}) => {
  return (
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
              <p className="font-semibold text-gray-800">{a.judul_tugas}</p>
              <p className="text-sm text-gray-500">{a.instruksi || "-"}</p>
            </div>
            <div className="flex items-center gap-2">
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
            {/* Download button for assignment file */}
            {a.file_path && assignmentSignedUrls[a.assignment_id] && (
              <a
                href={assignmentSignedUrls[a.assignment_id]}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-200 rounded-full"
                rel="noopener noreferrer"
                download
                title="Unduh Tugas"
              >
                <BsDownload />
              </a>
            )}
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
    </div>
  );
};

export default TabAssignments;
