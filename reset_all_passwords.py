import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User

# Password to set for all users
NEW_PASSWORD = 'shubair.fast.23'

print("=== Resetting Passwords for All Users ===\n")

# Get all users
users = User.objects.all()
total_users = users.count()

print(f"Found {total_users} users in the database.\n")

# Reset password for each user
success_count = 0
failed_count = 0

for user in users:
    try:
        user.set_password(NEW_PASSWORD)
        user.save()
        success_count += 1
        print(f"✓ Password reset for: {user.username} (Role: {user.role})")
    except Exception as e:
        failed_count += 1
        print(f"✗ Failed to reset password for {user.username}: {str(e)}")

print(f"\n=== Summary ===")
print(f"Total users: {total_users}")
print(f"Successfully reset: {success_count}")
print(f"Failed: {failed_count}")

print(f"\n=== New Login Credentials ===")
print(f"Password for ALL users: {NEW_PASSWORD}")
print(f"\nYou can now login with any username and password: {NEW_PASSWORD}")

# Verify with a test authentication
print(f"\n=== Verification ===")
from django.contrib.auth import authenticate

# Test with the first user
if users.exists():
    test_user = users.first()
    authenticated = authenticate(username=test_user.username, password=NEW_PASSWORD)
    if authenticated:
        print(f"✓ Verification successful: {test_user.username} can authenticate with the new password")
    else:
        print(f"✗ Verification failed: Authentication test failed")
