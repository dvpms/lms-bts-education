// Test login functionality
const testLogin = async () => {
  const loginData = {
    email: 'test@example.com',
    password: 'testpassword123'  // Updated to match database
  };

  try {
    console.log('🔄 Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    console.log('📋 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Login API working correctly!');
      console.log('🔑 Token:', data.data.access_token);
      console.log('👤 User:', data.data.user.email);
      console.log('👤 Role:', data.data.user.role);
    } else {
      console.log('❌ Login failed:', data.error);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Run test
testLogin();
