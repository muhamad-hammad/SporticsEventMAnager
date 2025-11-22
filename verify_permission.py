import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
from django.conf import settings
if not settings.configured:
    django.setup()
settings.ALLOWED_HOSTS += ['testserver']

from core.models import User, Sport, Team, Match, House
from rest_framework.test import APIClient
from django.urls import reverse
from datetime import datetime, timedelta
from django.utils import timezone
import random

def run_verification():
    print("Starting verification...")

    # Setup data
    suffix = random.randint(1000, 9999)
    # Create user with role='admin' but NOT is_staff/superuser
    admin_user = User.objects.create_user(f'admin_role_{suffix}', f'admin{suffix}@test.com', 'password', role='admin')
    user_player = User.objects.create_user(f'player_test_{suffix}', f'player{suffix}@test.com', 'password', role='player')
    
    sport = Sport.objects.create(sports_name=f"Test Sport {suffix}", status="Sports")
    house = House.objects.create(house_name="Test House")
    
    team1 = Team.objects.create(team_name=f"Team A {suffix}", event_type="LOG", sport=sport, house=house, created_by=admin_user)
    team2 = Team.objects.create(team_name=f"Team B {suffix}", event_type="LOG", sport=sport, house=house, created_by=admin_user)
    
    print(f"Team 1 ID: {team1.id}, Team 2 ID: {team2.id}")
    
    client = APIClient()

    # 1. Admin Role Schedule Match
    print("\nTesting Admin Role Schedule Match...")
    client.force_authenticate(user=admin_user)
    match_data = {
        "sport": sport.id,
        "team1": team1.id,
        "team2": team2.id,
        "date": (timezone.now() + timedelta(days=1)).isoformat(),
        "round": "quarter_final",
        "status": "scheduled"
    }
    response = client.post('/api/matches/', match_data)
    if response.status_code == 201:
        print("✅ Admin (role='admin') scheduled match successfully.")
        match_id = response.data['id']
    else:
        print(f"❌ Admin (role='admin') failed to schedule match: {response.data}")
        return

    # 2. User View Match
    print("\nTesting User View Match...")
    client.force_authenticate(user=user_player)
    response = client.get(f'/api/matches/{match_id}/')
    if response.status_code == 200:
        print("✅ User viewed match successfully.")
    else:
        print(f"❌ User failed to view match: {response.status_code}")

    # 3. User Try to Schedule Match (Should Fail)
    print("\nTesting User Schedule Match (Should Fail)...")
    response = client.post('/api/matches/', match_data)
    if response.status_code == 403:
        print("✅ User correctly denied from scheduling match.")
    else:
        print(f"❌ User was able to schedule match or wrong error: {response.status_code}")

    # 4. Admin Enter Result
    print("\nTesting Admin Enter Result...")
    client.force_authenticate(user=admin_user)
    result_data = {
        "winner_id": team1.id,
        "score_team1": 2,
        "score_team2": 1,
        "notes": "Good game"
    }
    response = client.patch(f'/api/matches/{match_id}/enter_result/', result_data)
    if response.status_code == 200:
        print("✅ Admin entered result successfully.")
    else:
        print(f"❌ Admin failed to enter result: {response.data}")

    # Cleanup
    print("\nCleaning up...")
    match = Match.objects.get(id=match_id)
    match.delete()
    team1.delete()
    team2.delete()
    sport.delete()
    house.delete()
    admin_user.delete()
    user_player.delete()
    print("Done.")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"❌ Error during verification: {e}")
