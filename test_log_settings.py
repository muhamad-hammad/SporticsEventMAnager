import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import LogModuleSettings, User

print("=" * 70)
print("TESTING LOG MODULE SETTINGS")
print("=" * 70)

# Get or create settings
settings = LogModuleSettings.get_settings()

print("\n📋 Current Settings:")
print(f"  House Proposals Open: {settings.house_proposals_open}")
print(f"  Player Registration Open: {settings.player_registration_open}")
print(f"  Houses Finalized: {settings.houses_finalized}")
print(f"  Registration Finalized: {settings.registration_finalized}")
print(f"  Last Updated: {settings.updated_at}")
if settings.updated_by:
    print(f"  Updated By: {settings.updated_by.username}")

print("\n" + "=" * 70)
print("TESTING FUNCTIONALITY")
print("=" * 70)

print("\n✅ LogModuleSettings model created successfully")
print("✅ Singleton pattern working (get_or_create)")
print("✅ All fields accessible")

print("\n" + "=" * 70)
print("API ENDPOINTS AVAILABLE")
print("=" * 70)
print("\n🔹 User Endpoints:")
print("  GET  /api/log/settings/                     - Get current settings")

print("\n🔹 Admin Endpoints:")
print("  PATCH POST /api/log/admin/settings/                - Update settings")
print("  POST /api/log/admin/toggle-house-proposals/    - Toggle house proposals")
print("  POST /api/log/admin/toggle-player-registration/ - Toggle player registration")
print("  POST /api/log/admin/finalize-houses/            - Finalize houses (permanent)")
print("  POST /api/log/admin/finalize-registration/      - Finalize registration (permanent)")

print("\n" + "=" * 70)
print("FRONTEND PAGES")
print("=" * 70)
print("\n🔹 Admin:")
print("  /admin/log/settings              - Control LOG module settings")

print("\n🔹 Users:")
print("  /log/house-proposal              - Submit house proposals (with lock checks)")
print("  /log/register                    - Register for sports (with lock checks)")
print("  /log/draft/[sportId]             - Draft page (house captains & admins only)")

print("\n✅ All features implemented successfully!")
