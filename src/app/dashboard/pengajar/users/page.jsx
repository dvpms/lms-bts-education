"use client";


import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FiUserPlus, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: "",
    nama_lengkap: "",
    role: "siswa",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: `Hapus user?`,
      text: `Yakin ingin menghapus user ${user.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    setSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("user_id", user.user_id);
      if (dbError) throw dbError;
      // Refresh daftar user
      const { data } = await supabase
        .from("users")
        .select("user_id, email, nama_lengkap, role");
      setUsers(data || []);
      await Swal.fire("Berhasil!", "User berhasil dihapus!", "success");
    } catch (err) {
      setError(err.message);
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Dummy users for demo
  const dummyUsers = [
    {
      user_id: "dummy-1",
      nama_lengkap: "Siti Siswa",
      email: "siswa@bts.com",
      role: "siswa",
    },
    {
      user_id: "dummy-2",
      nama_lengkap: "Budi Pengajar",
      email: "pengajar@bts.com",
      role: "pengajar",
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("users")
          .select("user_id, email, nama_lengkap, role");
        if (error) setError(error.message);
        setUsers(data && data.length > 0 ? data : dummyUsers);
      } catch (err) {
        setUsers(dummyUsers);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      password: "", // password tidak diedit di sini
    });
    setShowModal(true);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setForm({ email: "", nama_lengkap: "", role: "siswa", password: "" });
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      if (editingUser) {
        // Edit user (update nama_lengkap & role, email tidak diedit)
        const { error: dbError } = await supabase
          .from("users")
          .update({
            nama_lengkap: form.nama_lengkap,
            role: form.role,
          })
          .eq("user_id", editingUser.user_id);
        if (dbError) throw dbError;
        setEditingUser(null);
        setForm({ email: "", nama_lengkap: "", role: "siswa", password: "" });
        setShowModal(false);
        await Swal.fire("Berhasil!", "User berhasil diupdate!", "success");
      } else {
        // Tambah user baru
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: form.email,
            password: form.password,
          }
        );
        if (authError) throw authError;
        const { user } = authData;
        const { error: dbError } = await supabase.from("users").insert({
          user_id: user.id,
          email: form.email,
          nama_lengkap: form.nama_lengkap,
          role: form.role,
        });
        if (dbError) throw dbError;
        setForm({ email: "", nama_lengkap: "", role: "siswa", password: "" });
        setShowModal(false);
        await Swal.fire("Berhasil!", "User berhasil ditambahkan!", "success");
      }
      // Refresh daftar user
      const { data } = await supabase
        .from("users")
        .select("user_id, email, nama_lengkap, role");
      setUsers(data && data.length > 0 ? data : dummyUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Kelola User</h2>
          <p className="text-gray-500 mt-1">Tambah, edit, dan kelola semua pengguna sistem.</p>
        </div>
        <button
          id="add-user-btn"
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 shadow-lg transition-transform transform hover:scale-105"
          onClick={() => {
            setEditingUser(null);
            setForm({ email: "", nama_lengkap: "", role: "siswa", password: "" });
            setShowModal(true);
          }}
        >
          <FiUserPlus className="text-xl" />
          <span className="font-semibold">Tambah User Baru</span>
        </button>
      </div>

      {/* Tabel Daftar User */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-green-600">
            <tr>
              <th className="px-6 py-3 font-semibold">Nama Lengkap</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Peran</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Memuat...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.user_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.nama_lengkap}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${u.role === "pengajar" ? "text-green-700 bg-green-100" : "text-blue-700 bg-blue-100"}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="edit-btn p-2 rounded hover:bg-blue-100 text-blue-600"
                      title="Edit User"
                      onClick={() => handleEditClick(u)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="delete-btn p-2 rounded hover:bg-red-100 text-red-600 ml-2"
                      title="Hapus User"
                      onClick={() => handleDeleteUser(u)}
                      disabled={submitting}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 modal-transition">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg transform modal-transition">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingUser ? "Edit User" : "Tambah User Baru"}
              </h2>
              <button
                className="p-2 hover:bg-gray-200 rounded-full"
                onClick={handleCancelEdit}
                title="Tutup"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Isi untuk membuat password"}
                  required={!editingUser}
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Peran</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="siswa">Siswa</option>
                  <option value="pengajar">Pengajar</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                  onClick={handleCancelEdit}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  disabled={submitting}
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
