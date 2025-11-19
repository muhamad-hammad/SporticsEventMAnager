# Authentication Troubleshooting Guide

## Issues Fixed

### 1. **localStorage Access in Server Components**
The main issue was that Next.js 13+ App Router runs components on the server by default, but `localStorage` is only available in browsers.

**Solution Applied:**
- Added `typeof window !== 'undefined'` checks before accessing `localStorage` in:
  - `AuthContext.tsx` (login, logout, useEffect)
  - `lib/api.ts` (request and response interceptors)

### 2. **ALLOWED_HOSTS Configuration**
Django was blocking requests because `ALLOWED_HOSTS` was empty.

**Solution Applied:**
- Updated `ALLOWED_HOSTS = ['127.0.0.1', 'localhost']` in `settings.py`

### 3. **CORS Headers**
Added additional CORS headers to ensure proper cross-origin requests.

**Solution Applied:**
- Added `CORS_ALLOW_HEADERS` configuration in `settings.py`

### 4. **Environment Variables**
Created `.env.local` for better configuration management.

## How to Test

### Step 1: Start the Backend Server

```powershell
# Navigate to backend directory
cd sportics_backend

# Activate virtual environment
..\env\Scripts\Activate.ps1

# Run migrations (if needed)
python manage.py migrate

# Start Django server
python manage.py runserver
```

### Step 2: Test Backend Endpoints (Optional)

```powershell
# Install requests library if needed
pip install requests

# Run the test script
python test_backend.py
```

This will verify:
- Server is running
- Registration endpoint works
- Login endpoint works
- JWT tokens are generated correctly
- Authenticated endpoints work

### Step 3: Start the Frontend Server

```powershell
# Open a new terminal
# Navigate to frontend directory
cd sportics_backend\frontend

# Install dependencies (if needed)
npm install

# Start Next.js development server
npm run dev
```

### Step 4: Test Login and Registration

1. Open browser to `http://localhost:3000`
2. Navigate to `/register` page
3. Create a new account
4. Check browser console for any errors (F12 → Console tab)
5. After successful registration, you should be redirected to dashboard
6. Try logging out and logging in again at `/login`

## Common Errors and Solutions

### Error: "localStorage is not defined"
**Cause:** Trying to access localStorage during server-side rendering  
**Solution:** ✓ Fixed - Added browser checks

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Cause:** Backend not allowing requests from frontend origin  
**Solution:** ✓ Fixed - Updated CORS settings in `settings.py`

### Error: "Invalid Host header"
**Cause:** ALLOWED_HOSTS doesn't include the server address  
**Solution:** ✓ Fixed - Added '127.0.0.1' and 'localhost' to ALLOWED_HOSTS

### Error: Network request failed / ERR_CONNECTION_REFUSED
**Cause:** Backend server is not running  
**Solution:** Make sure Django server is running on port 8000

### Error: 404 Not Found on `/auth/jwt/create/`
**Cause:** Djoser URLs not properly configured  
**Solution:** Already configured in `urls.py` - verify backend is running

## Debugging Tips

### Check Backend Server
```powershell
# Make sure server is running
# You should see: "Starting development server at http://127.0.0.1:8000/"
```

### Check Browser Console
Open Developer Tools (F12) and look for:
- Red error messages
- Failed network requests (Network tab)
- CORS errors

### Check Network Requests
In browser DevTools → Network tab:
1. Try to login
2. Look for the request to `http://127.0.0.1:8000/auth/jwt/create/`
3. Check:
   - Request status (should be 200 for success)
   - Request payload (username and password)
   - Response (should contain access and refresh tokens)

### Test API Directly
Use curl or Postman to test endpoints:

```powershell
# Test registration
Invoke-RestMethod -Uri "http://127.0.0.1:8000/auth/users/" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"test","email":"test@test.com","password":"TestPass123","re_password":"TestPass123"}'

# Test login
Invoke-RestMethod -Uri "http://127.0.0.1:8000/auth/jwt/create/" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"test","password":"TestPass123"}'
```

## Environment Setup

Make sure you have:
- Python 3.11+ with Django backend running on port 8000
- Node.js with Next.js frontend running on port 3000
- Virtual environment activated for backend
- All dependencies installed for both frontend and backend

## Files Modified

1. `frontend/context/AuthContext.tsx` - Added browser checks for localStorage
2. `frontend/lib/api.ts` - Added browser checks for axios interceptors
3. `frontend/.env.local` - Created environment variable file
4. `sportics_backend/settings.py` - Updated ALLOWED_HOSTS and CORS settings
5. `test_backend.py` - Created backend API test script

## Next Steps

After verifying login/registration works:
1. Test the dashboard page functionality
2. Verify JWT token refresh works
3. Test logout functionality
4. Implement protected routes if needed
