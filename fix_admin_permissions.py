import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User

# Check the admin user
admin = User.objects.filter(username='admin').first()

if admin:
    print("=" * 70)
    print("CURRENT ADMIN USER STATUS")
    print("=" * 70)
    print(f"Username: {admin.username}")
    print(f"Email: {admin.email}")
    print(f"Role: {admin.role}")
    print(f"is_staff: {admin.is_staff}")
    print(f"is_superuser: {admin.is_superuser}")
    print(f"is_active: {admin.is_active}")
    
    # Fix admin permissions
    print("\n" + "=" * 70)
    print("UPDATING ADMIN PERMISSIONS")
    print("=" * 70)
    
    admin.role = 'admin'
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.save()
    
    print("✅ Admin user updated!")
    print(f"Role: {admin.role}")
    print(f"is_staff: {admin.is_staff}")
    print(f"is_superuser: {admin.is_superuser}")
else:
    print("❌ Admin user not found!")
    print("\nCreating admin user...")
    admin = User.objects.create_user(
        username='admin',
        email='admin@sportics.com',
        password='admin',
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    print(f"✅ Created admin user with username: admin, password: admin")
