const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
console.log('Checking .env.local at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment variables:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Key length:', supabaseKey?.length);
console.log('- Key preview:', supabaseKey?.substring(0, 50) + '...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('\n--- Creating test user in database ---');
    
    // Insert into users table directly
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          nama_lengkap: 'Test User Pengajar',
          email: 'test@example.com',
          password: 'testpassword123', // For testing only
          role: 'pengajar'
        }
      ])
      .select();

    if (userError) {
      console.error('❌ Database error:', userError);
      return;
    }

    console.log('✅ Database user created:', userData);
    console.log('✅ Test user created successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestUser().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
