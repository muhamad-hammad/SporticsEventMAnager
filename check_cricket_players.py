import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import Sport, PlayerRegistration

# Get cricket sport
cricket = Sport.objects.filter(sports_name__icontains='cricket').first()

if cricket:
    players = PlayerRegistration.objects.filter(sport=cricket)
    pending = players.filter(status='pending')
    approved = players.filter(status='approved')
    rejected = players.filter(status='rejected')
    
    print(f"Cricket Sport ID: {cricket.id}")
    print(f"\nTotal Cricket Players: {players.count()}")
    print(f"  Pending: {pending.count()}")
    print(f"  Approved: {approved.count()}")
    print(f"  Rejected: {rejected.count()}")
    
    if pending.exists():
        print("\n=== PENDING PLAYERS ===")
        for p in pending:
            print(f"  ID: {p.id} - {p.user.username} ({p.user.email})")
    
    if approved.exists():
        print("\n=== APPROVED PLAYERS ===")
        for p in approved:
            print(f"  ID: {p.id} - {p.user.username} ({p.user.email})")
            
    # Show bulk approval command
    if pending.exists():
        pending_ids = list(pending.values_list('id', flat=True))
        print(f"\n=== BULK APPROVE COMMAND ===")
        print(f"PlayerRegistration.objects.filter(id__in={pending_ids}).update(status='approved')")
else:
    print("Cricket sport not found!")
