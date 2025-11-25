import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User

# Check password status for first few users
print("=== Checking User Password Status ===\n")
users = User.objects.all()[:5]

for user in users:
    print(f"Username: {user.username}")
    print(f"  - Has usable password: {user.has_usable_password()}")
    print(f"  - Password field: {user.password[:50] if user.password else 'EMPTY'}")
    print(f"  - Is active: {user.is_active}")
    print()

# Let's fix by setting a password for superuser
print("=== Setting Password for Test Users ===\n")

test_users = [
    ('superuser', 'admin123'),
    ('admin', 'admin123'),
    ('shubair', 'shubair123'),
]

for username, password in test_users:
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"✓ Password set for {username}: {password}")
    except User.DoesNotExist:
        print(f"✗ User {username} not found")

print("\n=== Verification ===")
# Verify password was set
from django.contrib.auth import authenticate
for username, password in test_users:
    authenticated = authenticate(username=username, password=password)
    if authenticated:
        print(f"✓ {username} can now authenticate with password: {password}")
    else:
        print(f"✗ {username} authentication failed")
