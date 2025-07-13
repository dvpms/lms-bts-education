import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/courses - Mendapatkan semua kursus
export async function GET(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token:', token);
    
    // Decode custom token
    let userData;
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf8');
      userData = JSON.parse(decodedToken);
      console.log('Decoded user data:', userData);
    } catch (error) {
      console.error('Token decode error:', error);
      return NextResponse.json(
        { error: 'Token tidak valid' }, 
        { status: 401 }
      );
    }

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userData.user_id)
      .single();

    if (userError || !user) {
      console.error('User verification error:', userError);
      return NextResponse.json(
        { error: 'User tidak valid' }, 
        { status: 401 }
      );
    }

    // Ambil semua kursus dengan informasi pengajar
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        course_id,
        nama_course,
        deskripsi,
        id_pengajar,
        users!courses_id_pengajar_fkey(nama_lengkap, email)
      `);

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data kursus' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      courses: courses,
      message: 'Data kursus berhasil diambil'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' }, 
      { status: 500 }
    );
  }
}

// POST /api/courses - Membuat kursus baru
export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Decode custom token
    let userData;
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf8');
      userData = JSON.parse(decodedToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token tidak valid' }, 
        { status: 401 }
      );
    }

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userData.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User tidak valid' }, 
        { status: 401 }
      );
    }

    // Cek apakah user adalah pengajar
    if (user.role !== 'pengajar') {
      return NextResponse.json(
        { error: 'Hanya pengajar yang dapat membuat kursus' }, 
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

    // Insert kursus baru
    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert([
        {
          nama_course: nama_course.trim(),
          deskripsi: deskripsi ? deskripsi.trim() : null,
          id_pengajar: user.user_id
        }
      ])
      .select(`
        course_id,
        nama_course,
        deskripsi,
        id_pengajar,
        users!courses_id_pengajar_fkey(nama_lengkap, email)
      `)
      .single();

    if (insertError) {
      console.error('Error creating course:', insertError);
      return NextResponse.json(
        { error: 'Gagal membuat kursus baru' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newCourse,
      message: 'Kursus berhasil dibuat'
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' }, 
      { status: 500 }
    );
  }
}
