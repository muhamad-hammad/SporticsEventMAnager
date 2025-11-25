import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import Sport, PlayerRegistration, DraftSession, DraftPick, Team, User

# Get cricket
cricket = Sport.objects.get(id=7)
session = DraftSession.objects.get(sport=cricket)

# Get teams
teams = list(Team.objects.filter(sport_id=cricket.id, event_type='LOG').order_by('id'))
print(f"Teams ({len(teams)}):")
for i, team in enumerate(teams):
    print(f"  {i}. {team.team_name} - Captain: {team.captain.username if team.captain else 'None'} (ID: {team.captain.id if team.captain else 'None'})")

# Current turn
print(f"\nSession current_pick_index: {session.current_pick_index}")
current_team = teams[session.current_pick_index % len(teams)]
print(f"Current team's turn: {current_team.team_name}")
print(f"Current team captain: {current_team.captain.username if current_team else 'None'}")
print(f"Current team captain ID: {current_team.captain.id if current_team.captain else 'None'}")

# Check all users
print(f"\nAll users with role 'captain':")
captains = User.objects.filter(role='captain')
for cap in captains:
    print(f"  - {cap.username} (ID: {cap.id})")
