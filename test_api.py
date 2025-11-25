import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import Sport, PlayerRegistration, DraftSession, DraftPick, Team, User
from core.serializers import PlayerRegistrationSerializer

# Get cricket
cricket = Sport.objects.get(id=7)

# Simulate the API logic
drafted_player_ids = DraftPick.objects.filter(
    team__sport_id=cricket.id,
    status='approved'
).values_list('player_id', flat=True)

print(f"Drafted Player IDs: {list(drafted_player_ids)}")

available_players = PlayerRegistration.objects.filter(
    sport_id=cricket.id,
    status='approved'
).exclude(id__in=drafted_player_ids).select_related('user')

print(f"\nAvailable Players Count: {available_players.count()}")
print(f"Available Players Query: {available_players.query}")

for player in available_players:
    print(f"\nPlayer ID: {player.id}")
    print(f"User: {player.user.username}")
    print(f"Sport: {player.sport.sports_name}")
    print(f"Status: {player.status}")

# Serialize
serializer = PlayerRegistrationSerializer(available_players, many=True)
print(f"\nSerialized Data: {serializer.data}")
