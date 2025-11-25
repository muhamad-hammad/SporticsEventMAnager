import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from django.test import RequestFactory
from core.views import ToggleHouseProposals, TogglePlayerRegistration
from core.models import User, LogModuleSettings

print("=" * 70)
print("TESTING TOGGLE ENDPOINTS")
print("=" * 70)

# Get or create an admin user
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin.set_password('admin123')
    admin.save()
    print(f"\n✅ Created admin user: {admin.username}")
else:
    print(f"\n✅ Using existing admin user: {admin.username}")

# Get settings
settings = LogModuleSettings.get_settings()
print(f"\n📋 Initial Settings:")
print(f"  House Proposals Open: {settings.house_proposals_open}")
print(f"  Player Registration Open: {settings.player_registration_open}")

# Test toggle house proposals
print("\n" + "=" * 70)
print("TESTING TOGGLE HOUSE PROPOSALS")
print("=" * 70)

factory = RequestFactory()
request = factory.post('/api/log/admin/toggle-house-proposals/')
request.user = admin

view = ToggleHouseProposals()
view.request = request

try:
    response = view.post(request)
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"✅ Response: {response.data}")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

# Refresh settings
settings.refresh_from_db()
print(f"\n📋 After Toggle:")
print(f"  House Proposals Open: {settings.house_proposals_open}")

# Test toggle player registration
print("\n" + "=" * 70)
print("TESTING TOGGLE PLAYER REGISTRATION")
print("=" * 70)

request2 = factory.post('/api/log/admin/toggle-player-registration/')
request2.user = admin

view2 = TogglePlayerRegistration()
view2.request = request2

try:
    response2 = view2.post(request2)
    print(f"\n✅ Status Code: {response2.status_code}")
    print(f"✅ Response: {response2.data}")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

# Refresh settings
settings.refresh_from_db()
print(f"\n📋 After Toggle:")
print(f"  Player Registration Open: {settings.player_registration_open}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
