import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Helper function untuk verifikasi token
async function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token tidak ditemukan');
  }

  const token = authHeader.substring(7);
  
  // Decode custom token
  let userData;
  try {
    const decodedToken = Buffer.from(token, 'base64').toString('utf8');
    userData = JSON.parse(decodedToken);
  } catch (error) {
    throw new Error('Token tidak valid');
  }

  // Verify user exists in database
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userData.user_id)
    .single();

  if (userError || !user) {
    throw new Error('User tidak valid');
  }

  return user;
}

// GET /api/courses/[id] - Mendapatkan satu kursus berdasarkan ID
export async function GET(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);

    const { id } = await params;
    const courseId = id;

    // Validasi course ID
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        { error: 'ID kursus tidak valid' }, 
        { status: 400 }
      );
    }

    // Ambil data kursus dengan informasi pengajar
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        course_id,
        nama_course,
        deskripsi,
        id_pengajar,
        users!courses_id_pengajar_fkey(nama_lengkap, email)
      `)
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Kursus tidak ditemukan' }, 
          { status: 404 }
        );
      }
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data kursus' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Data kursus berhasil diambil'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    if (error.message.includes('Token') || error.message.includes('User')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' }, 
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update kursus berdasarkan ID
export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);

    // Ambil data user dari database untuk cek role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id, role')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Data user tidak ditemukan' }, 
        { status: 404 }
      );
    }

    const { id } = await params;
    const courseId = id;

    // Validasi course ID
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        { error: 'ID kursus tidak valid' }, 
        { status: 400 }
      );
    }

    // Cek apakah kursus ada dan user adalah pengajar kursus tersebut atau admin
    const { data: existingCourse, error: courseError } = await supabase
      .from('courses')
      .select('course_id, id_pengajar, nama_course')
      .eq('course_id', courseId)
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Kursus tidak ditemukan' }, 
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Gagal mengambil data kursus' }, 
        { status: 500 }
      );
    }

    // Cek authorization - hanya pengajar yang membuat kursus yang bisa update
    if (userData.role !== 'pengajar' || existingCourse.id_pengajar !== userData.user_id) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengubah kursus ini' }, 
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nama_course, deskripsi } = body;

    // Validasi input
    if (!nama_course || nama_course.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kursus harus diisi' }, 
        { status: 400 }
      );
    }

    // Update kursus
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({
        nama_course: nama_course.trim(),
        deskripsi: deskripsi ? deskripsi.trim() : null
      })
      .eq('course_id', courseId)
      .select(`
        course_id,
        nama_course,
        deskripsi,
        id_pengajar,
        users!courses_id_pengajar_fkey(nama_lengkap, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating course:', updateError);
      return NextResponse.json(
        { error: 'Gagal memperbarui kursus' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Kursus berhasil diperbarui'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Hapus kursus berdasarkan ID
export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const user = await verifyToken(request);

    const { id } = await params;
    const courseId = id;

    // Validasi course ID
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json(
        { error: 'ID kursus tidak valid' }, 
        { status: 400 }
      );
    }

    // Cek apakah kursus ada dan user adalah pemiliknya atau admin
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('course_id, nama_course, id_pengajar')
      .eq('course_id', courseId)
      .single();

    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Kursus tidak ditemukan' }, 
          { status: 404 }
        );
      }
      console.error('Error fetching course:', courseError);
      return NextResponse.json(
        { error: 'Gagal mengambil data kursus' }, 
        { status: 500 }
      );
    }

    // Cek permission: hanya pemilik kursus atau admin yang bisa hapus
    if (course.id_pengajar !== user.user_id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus kursus ini' }, 
        { status: 403 }
      );
    }

    // Hapus kursus (akan cascade delete ke materials, assignments, submissions)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) {
      console.error('Error deleting course:', deleteError);
      return NextResponse.json(
        { error: 'Gagal menghapus kursus' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Kursus "${course.nama_course}" berhasil dihapus`,
      data: {
        deleted_course_id: parseInt(courseId),
        nama_course: course.nama_course
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    if (error.message.includes('Token') || error.message.includes('User')) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' }, 
      { status: 500 }
    );
  }
}
