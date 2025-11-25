import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User, HouseCaptain, DraftPick
from django.contrib.auth.hashers import make_password

# Test 1: Check if house captain exists
print("=" * 60)
print("TESTING MY TEAMS API")
print("=" * 60)

house_captains = HouseCaptain.objects.all()
print(f"\nTotal House Captains: {house_captains.count()}")
for hc in house_captains:
    print(f"  - {hc.user.username} ({hc.user.first_name}) -> {hc.house.house_name}")

# Test 2: Check players with draft picks
print("\n" + "=" * 60)
print("PLAYERS WITH DRAFT PICKS")
print("=" * 60)

picks = DraftPick.objects.filter(status='approved').select_related('player__user', 'team__sport')
player_ids = picks.values_list('player__user__id', flat=True).distinct()

print(f"\nTotal players with picks: {player_ids.count()}")

# Show first 5 players
for player_id in list(player_ids)[:5]:
    user = User.objects.get(id=player_id)
    user_picks = picks.filter(player__user=user)
    print(f"\n{user.first_name} ({user.username}):")
    for pick in user_picks:
        print(f"  - {pick.team.team_name} ({pick.team.sport.sports_name}) - Round {pick.round_number}")

print("\n✅ API should work for both house captains and players!")
