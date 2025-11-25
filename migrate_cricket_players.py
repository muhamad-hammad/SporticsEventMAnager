import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import Sport, PlayerRegistration, PlayerSportRegistration, User

# Get cricket sport
cricket = Sport.objects.get(id=7)

print("=" * 60)
print("CRICKET PLAYER REGISTRATION STATUS")
print("=" * 60)

# Check PlayerSportRegistration (old model)
old_registrations = PlayerSportRegistration.objects.filter(sport=cricket)
print(f"\n1. PlayerSportRegistration (OLD MODEL): {old_registrations.count()}")
for reg in old_registrations[:5]:
    print(f"   - {reg.player.user.username}")
if old_registrations.count() > 5:
    print(f"   ... and {old_registrations.count() - 5} more")

# Check PlayerRegistration (new model - used by draft)
new_registrations = PlayerRegistration.objects.filter(sport=cricket)
print(f"\n2. PlayerRegistration (NEW MODEL - DRAFT): {new_registrations.count()}")
print(f"   Pending: {new_registrations.filter(status='pending').count()}")
print(f"   Approved: {new_registrations.filter(status='approved').count()}")
print(f"   Rejected: {new_registrations.filter(status='rejected').count()}")

# Migration option
if old_registrations.exists() and not new_registrations.exists():
    print("\n" + "=" * 60)
    print("⚠️  DATA MIGRATION NEEDED!")
    print("=" * 60)
    print("Your players are in OLD model, but draft uses NEW model.")
    print("\nDo you want to migrate? (y/n): ", end="")
    
    choice = input().lower()
    if choice == 'y':
        print("\nMigrating players...")
        migrated = 0
        for old_reg in old_registrations:
            # Check if user exists
            user = old_reg.player.user
            
            # Create in new model
            new_reg, created = PlayerRegistration.objects.get_or_create(
                user=user,
                sport=cricket,
                defaults={'status': 'approved'}  # Auto-approve
            )
            if created:
                migrated += 1
                print(f"  ✓ Migrated: {user.username}")
        
        print(f"\n✅ Migrated {migrated} players to PlayerRegistration")
        print("✅ All players auto-approved and ready for draft!")
        
        # Show final count
        final_count = PlayerRegistration.objects.filter(sport=cricket, status='approved').count()
        print(f"\nTotal approved cricket players: {final_count}")
    else:
        print("Migration cancelled.")

elif new_registrations.filter(status='pending').exists():
    print("\n" + "=" * 60)
    print("BULK APPROVE PENDING PLAYERS")
    print("=" * 60)
    pending = new_registrations.filter(status='pending')
    print(f"\nFound {pending.count()} pending players:")
    for p in pending[:10]:
        print(f"  - {p.user.username}")
    if pending.count() > 10:
        print(f"  ... and {pending.count() - 10} more")
    
    print("\nApprove all? (y/n): ", end="")
    choice = input().lower()
    if choice == 'y':
        count = pending.update(status='approved')
        print(f"\n✅ Approved {count} players!")
    else:
        print("Approval cancelled.")

else:
    print("\n✅ All players already approved!")
    print(f"Total approved cricket players: {new_registrations.filter(status='approved').count()}")
