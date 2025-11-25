# Bulk User & Player Registration Guide

## Method 1: CSV Import (Recommended for bulk operations)

### Step 1: Prepare CSV file
Create a CSV file with this format:
```csv
username,email,password,first_name,last_name,contact_no,department,role,sport_ids
john_doe,john@example.com,password123,John,Doe,1234567890,CS,player,"1,2,3"
```

**Fields:**
- `username` - unique username (required)
- `email` - email address (required)
- `password` - plain text password (required)
- `first_name` - first name (optional)
- `last_name` - last name (optional)
- `contact_no` - phone number (optional)
- `department` - department name (optional)
- `role` - user role: general/player/captain/admin (default: general)
- `sport_ids` - comma-separated sport IDs in quotes, e.g., "1,2,3" (optional)

### Step 2: Run the command
```powershell
# Activate virtual environment first
& D:/Users/Shubair/university/FifthSem/DB/Sportics/env/Scripts/Activate.ps1

# Navigate to project
cd sportics_backend

# Run bulk import
python manage.py bulk_register_players --csv sample_players.csv

# Or with custom CSV file
python manage.py bulk_register_players --csv path/to/your/file.csv
```

---

## Method 2: Interactive Registration (For few users)

```powershell
# Activate virtual environment
& D:/Users/Shubair/university/FifthSem/DB/Sportics/env/Scripts/Activate.ps1

# Navigate to project
cd sportics_backend

# Run interactive mode
python manage.py bulk_register_players --interactive
```

This will prompt you for each user's details one by one.

---

## Method 3: Django Shell (Manual/Programmatic)

```powershell
# Activate virtual environment
& D:/Users/Shubair/university/FifthSem/DB/Sportics/env/Scripts/Activate.ps1

cd sportics_backend

# Open Django shell
python manage.py shell
```

Then in the shell:

```python
from core.models import User, Player, Sport, PlayerSportRegistration
from django.db import transaction

# Create a user (starts as general, then becomes player)
with transaction.atomic():
    # Create user account with general role first
    user = User.objects.create_user(
        username='john_doe',
        email='john@example.com',
        password='password123',
        first_name='John',
        last_name='Doe',
        contact_no='1234567890',
        department='CS',
        role='general'  # Always start as general
    )
    
    # Create player profile and update role
    player = Player.objects.create(user=user)
    user.role = 'player'
    user.save()
    
    # Register player for sports
    sport1 = Sport.objects.get(id=1)  # Replace with actual sport ID
    sport2 = Sport.objects.get(id=2)  # Replace with actual sport ID
    
    PlayerSportRegistration.objects.create(player=player, sport=sport1)
    PlayerSportRegistration.objects.create(player=player, sport=sport2)

print(f"User {user.username} created and registered as player!")
```

### Bulk create in shell:
```python
from core.models import User, Player, Sport, PlayerSportRegistration
from django.db import transaction

users_data = [
    {'username': 'user1', 'email': 'user1@example.com', 'password': 'pass123', 'sports': [1, 2]},
    {'username': 'user2', 'email': 'user2@example.com', 'password': 'pass123', 'sports': [1]},
    {'username': 'user3', 'email': 'user3@example.com', 'password': 'pass123', 'sports': [2, 3]},
]

for data in users_data:
    with transaction.atomic():
        # Create user as general first
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role='general'
        )
        
        # Create player profile and update role to player
        player = Player.objects.create(user=user)
        user.role = 'player'
        user.save()
            
            for sport_id in data['sports']:
                sport = Sport.objects.get(id=sport_id)
                PlayerSportRegistration.objects.create(player=player, sport=sport)
        
        print(f"✓ Created {user.username}")
```

---

## Quick Commands Reference

```powershell
# List all sports (to get sport IDs)
python manage.py shell -c "from core.models import Sport; [print(f'{s.id}. {s.sports_name}') for s in Sport.objects.all()]"

# List all users
python manage.py shell -c "from core.models import User; [print(f'{u.username} - {u.role}') for u in User.objects.all()]"

# List all players
python manage.py shell -c "from core.models import Player; [print(f'{p.user.username}') for p in Player.objects.all()]"

# Delete a user (if you make a mistake)
python manage.py shell -c "from core.models import User; User.objects.get(username='username_here').delete()"
```

---

## Notes

1. **Sport IDs**: First check available sports using: `python manage.py shell -c "from core.models import Sport; Sport.objects.all().values_list('id', 'sports_name')"`

2. **Passwords**: The passwords in CSV are stored as hashed passwords automatically by Django's `create_user` method.

3. **Role field**: Must be one of: `general`, `player`, `captain`, or `admin`

4. **Validation**: If username or email already exists, you'll get an error for that user.

5. **Sample file**: Use `sample_players.csv` as a template.
