# Test Backend API Endpoints
# Run this after starting the Django server

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_backend():
    print("Testing Backend API Endpoints...")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/admin/")
        print("✓ Backend server is running")
    except Exception as e:
        print(f"✗ Backend server is NOT running: {e}")
        return
    
    # Test 2: Test registration endpoint
    test_user = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPass123!",
        "re_password": "TestPass123!"
    }
    
    print("\n1. Testing Registration Endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/users/",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 201:
            print(f"✓ Registration successful: {response.status_code}")
        elif response.status_code == 400:
            print(f"⚠ User might already exist: {response.json()}")
        else:
            print(f"✗ Registration failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Registration request failed: {e}")
    
    # Test 3: Test login endpoint
    print("\n2. Testing Login Endpoint...")
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/jwt/create/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            tokens = response.json()
            print(f"✓ Login successful!")
            print(f"  Access token: {tokens.get('access', 'N/A')[:50]}...")
            print(f"  Refresh token: {tokens.get('refresh', 'N/A')[:50]}...")
            
            # Test 4: Test authenticated endpoint
            print("\n3. Testing Authenticated Endpoint...")
            access_token = tokens.get('access')
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            response = requests.get(f"{BASE_URL}/auth/users/me/", headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                print(f"✓ Authenticated request successful!")
                print(f"  User data: {json.dumps(user_data, indent=2)}")
            else:
                print(f"✗ Authenticated request failed: {response.status_code} - {response.text}")
        else:
            print(f"✗ Login failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Login request failed: {e}")
    
    print("\n" + "=" * 50)
    print("Backend testing complete!")

if __name__ == "__main__":
    test_backend()
