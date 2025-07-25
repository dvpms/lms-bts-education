"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Yakin ingin menghapus user ${user.email}?`)) return;
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
      alert("User berhasil dihapus!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("users")
        .select("user_id, email, nama_lengkap, role");
      if (error) setError(error.message);
      setUsers(data || []);
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
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setForm({ email: "", nama_lengkap: "", role: "siswa", password: "" });
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
        alert("User berhasil diupdate!");
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
        alert("User berhasil ditambahkan!");
      }
      // Refresh daftar user
      const { data } = await supabase
        .from("users")
        .select("user_id, email, nama_lengkap, role");
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Kelola User</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingUser ? "Edit User" : "Tambah User Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1"
              disabled={!!editingUser}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nama Lengkap</label>
            <input
              type="text"
              name="nama_lengkap"
              value={form.nama_lengkap}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="siswa">Siswa</option>
              <option value="pengajar">Pengajar</option>
            </select>
          </div>
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            {editingUser && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting
                ? editingUser
                  ? "Menyimpan..."
                  : "Menambah..."
                : editingUser
                ? "Simpan Perubahan"
                : "Tambah User"}
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daftar User</h2>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2">Email</th>
                <th className="p-2">Nama Lengkap</th>
                <th className="p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.nama_lengkap}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    <button
                      className="p-2 rounded hover:bg-blue-100"
                      title="Edit User"
                      onClick={() => handleEditClick(u)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 ml-2"
                      title="Hapus User"
                      onClick={() => handleDeleteUser(u)}
                      disabled={submitting}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
