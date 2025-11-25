import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User
from django.contrib.auth import authenticate

# List all users
print("=== All Users in Database ===")
users = User.objects.all()
for user in users:
    print(f"Username: {user.username}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")

print("\n=== Testing Authentication ===")
# Test authentication with a user
if users.exists():
    test_user = users.first()
    print(f"\nTrying to authenticate as: {test_user.username}")
    
    # You need to provide the actual password here
    # Let's check if the user exists and is active
    print(f"User is_active: {test_user.is_active}")
    print(f"User has_usable_password: {test_user.has_usable_password()}")
    
    # Try authenticating with common test passwords
    test_passwords = ['admin', 'password', 'test123', '123456']
    for pwd in test_passwords:
        authenticated = authenticate(username=test_user.username, password=pwd)
        if authenticated:
            print(f"✓ Successfully authenticated with password: {pwd}")
            break
        else:
            print(f"✗ Failed authentication with password: {pwd}")
else:
    print("No users in database!")
