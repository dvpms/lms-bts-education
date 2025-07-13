import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Find user in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (userError || !user) {
      return Response.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Create simple JWT-like token (for testing purposes)
    const token = Buffer.from(JSON.stringify({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      timestamp: Date.now()
    })).toString('base64');

    return Response.json({
      success: true,
      message: 'Login berhasil',
      data: {
        access_token: token,
        user: {
          id: user.user_id,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
