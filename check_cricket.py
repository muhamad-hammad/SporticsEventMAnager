import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import Sport, PlayerRegistration, DraftSession, DraftPick, Team

# Find cricket sport
cricket = Sport.objects.filter(sports_name__icontains='cricket').first()
print(f"Cricket Sport: {cricket}")
if cricket:
    print(f"Cricket ID: {cricket.id}")
    print(f"Cricket Name: {cricket.sports_name}")
    print(f"Is available in LOG: {cricket.is_availableinLog}")
    
    # Check players
    total_players = PlayerRegistration.objects.filter(sport=cricket)
    print(f"\nTotal Players: {total_players.count()}")
    
    approved_players = PlayerRegistration.objects.filter(sport=cricket, status='approved')
    print(f"Approved Players: {approved_players.count()}")
    
    for player in approved_players[:5]:
        print(f"  - {player.user.username} (ID: {player.id})")
    
    # Check draft session
    session = DraftSession.objects.filter(sport=cricket).first()
    print(f"\nDraft Session: {session}")
    if session:
        print(f"Session Status: {session.status}")
        print(f"Current Round: {session.current_round}")
        print(f"Current Pick Index: {session.current_pick_index}")
    
    # Check teams
    teams = Team.objects.filter(sport=cricket, event_type='LOG')
    print(f"\nTeams for Cricket: {teams.count()}")
    for team in teams:
        print(f"  - {team.team_name} (House: {team.house.house_name})")
    
    # Check drafted players
    drafted_ids = DraftPick.objects.filter(
        team__sport=cricket, 
        status='approved'
    ).values_list('player_id', flat=True)
    print(f"\nAlready Drafted Players: {len(list(drafted_ids))}")
    
    # Available players
    available = PlayerRegistration.objects.filter(
        sport=cricket, 
        status='approved'
    ).exclude(id__in=drafted_ids)
    print(f"Available Players for Draft: {available.count()}")
    
else:
    print("Cricket sport not found!")
