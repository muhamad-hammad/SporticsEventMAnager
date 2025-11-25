import requests
import json

# Backend URL
BASE_URL = "http://127.0.0.1:8000"

# Test credentials - try with one of the users
test_credentials = [
    {"username": "superuser", "password": "admin123"},
    {"username": "admin", "password": "admin123"},
    {"username": "shubair", "password": "shubair123"},
]

print("=== Testing JWT Login Endpoint ===\n")

for creds in test_credentials:
    print(f"Testing with username: {creds['username']}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/jwt/create/",
            json=creds,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Login successful!")
            print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"Refresh Token: {data.get('refresh', 'N/A')[:50]}...")
            
            # Test /auth/users/me/ endpoint
            print("\nTesting /auth/users/me/ endpoint...")
            me_response = requests.get(
                f"{BASE_URL}/auth/users/me/",
                headers={"Authorization": f"Bearer {data['access']}"}
            )
            print(f"Status Code: {me_response.status_code}")
            print(f"User Data: {me_response.text}")
            break
        else:
            print(f"✗ Login failed")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                pass
        
        print("-" * 50)
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        print("-" * 50)

print("\n=== Checking if Django server is running ===")
try:
    response = requests.get(f"{BASE_URL}/api/")
    print(f"✓ Server is running (Status: {response.status_code})")
except Exception as e:
    print(f"✗ Server might not be running: {str(e)}")
