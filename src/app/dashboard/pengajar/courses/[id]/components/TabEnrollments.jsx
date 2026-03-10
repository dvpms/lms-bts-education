"use client";
import AddEnrollmentForm from "./AddEnrollmentForm";

const TabEnrollments = ({
  displayEnrollments,
  handleRemoveEnrollment,
  courseId,
  fetchEnrollments,
  allStudents,
  loadingStudents,
}) => {
  return (
    <div id="peserta-content" className="tab-content">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Daftar Siswa Terdaftar
      </h3>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <AddEnrollmentForm
          courseId={courseId}
          onEnrollmentAdded={fetchEnrollments}
          allStudents={allStudents}
          loadingStudents={loadingStudents}
        />
        <div className="space-y-4">
          {displayEnrollments.map((e) => (
            <div
              key={e.enrollment_id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <p className="font-semibold text-gray-800">
                {e.users.nama_lengkap} {e.users.email && `(${e.users.email})`}
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
      </div>
    </div>
  );
};

export default TabEnrollments;
