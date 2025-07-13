# LMS API Testing Documentation

## Overview
File ini berisi dokumentasi untuk testing API Learning Management System BTS Education menggunakan Postman Collection dan Newman.

## Files
- `lms-api-test.postman_collection.json` - Postman collection dengan test cases
- `lms-api-test.postman_environment.json` - Environment variables untuk testing

## Test Cases

### 1. Authentication Tests

#### Login with Email and Password
- **Endpoint**: `POST {{supabaseUrl}}/auth/v1/token?grant_type=password`
- **Tests**:
  - ✅ Status code is 200
  - ✅ Response is JSON
  - ✅ Response contains data.session and data.user
  - ✅ Session contains access_token
  - ✅ User contains email
  - ✅ Save access_token to environment
  - ✅ No error in response

#### Get Current User
- **Endpoint**: `GET {{supabaseUrl}}/auth/v1/user`
- **Tests**:
  - ✅ Status code is 200
  - ✅ Response contains user data
  - ✅ User is authenticated

#### Logout User
- **Endpoint**: `POST {{supabaseUrl}}/auth/v1/logout`
- **Tests**:
  - ✅ Status code is 204
  - ✅ Clear access token from environment

### 2. Database Operations Tests

#### Get Users Table
- **Endpoint**: `GET {{supabaseUrl}}/rest/v1/users?select=*`
- **Tests**:
  - ✅ Status code is 200
  - ✅ Response is an array

#### Get Courses Table
- **Endpoint**: `GET {{supabaseUrl}}/rest/v1/courses?select=*`
- **Tests**:
  - ✅ Status code is 200
  - ✅ Response is an array

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `supabaseUrl` | URL Supabase project | `https://xxx.supabase.co` |
| `supabaseAnonKey` | Anonymous key Supabase | `eyJhbGci...` |
| `testEmail` | Email untuk testing login | `test@example.com` |
| `testPassword` | Password untuk testing login | `testpassword123` |
| `accessToken` | Token yang disimpan setelah login | Auto-generated |

## Running Tests

### Via npm scripts:
```bash
# Run API tests
npm run test:api

# Run API tests with verbose output
npm run test:api:verbose
```

### Via newman directly:
```bash
# Basic test run
npx newman run lms-api-test.postman_collection.json -e lms-api-test.postman_environment.json

# With verbose output
npx newman run lms-api-test.postman_collection.json -e lms-api-test.postman_environment.json --verbose

# With HTML report
npx newman run lms-api-test.postman_collection.json -e lms-api-test.postman_environment.json -r html
```

## Prerequisites

1. **Supabase Project Setup**:
   - Project sudah dibuat di Supabase
   - Database schema sudah di-migrate
   - URL dan anon key sudah dikonfigurasi

2. **Test User Account**:
   - Buat user test di Supabase Auth
   - Update `testEmail` dan `testPassword` di environment

3. **Newman Installation**:
   ```bash
   npm install -D newman
   ```

## Notes

- Tests menggunakan Supabase REST API dan Auth API
- Access token akan disimpan otomatis setelah login berhasil
- Access token akan dihapus otomatis setelah logout
- Pastikan test user sudah terdaftar di Supabase Auth sebelum menjalankan tests

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**:
   - Check supabaseAnonKey di environment
   - Pastikan user test sudah terdaftar

2. **404 Not Found**:
   - Check supabaseUrl di environment
   - Pastikan endpoint URL benar

3. **Test Email/Password Invalid**:
   - Update testEmail dan testPassword di environment
   - Pastikan user sudah terdaftar di Supabase Auth

### Debug Steps:

1. Check environment variables
2. Verify Supabase project settings
3. Test login manually di browser
4. Check Newman verbose output
