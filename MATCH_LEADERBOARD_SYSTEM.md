# LOG Match & Leaderboard System

Complete implementation of the competitive match scheduling and leaderboard tracking system for the LOG (League of Games) module.

## Overview

The system enables:
- **Admin**: Create matches, update results, manage schedule
- **Users**: View schedule, check leaderboard standings
- **Automatic**: Winner determination, leaderboard calculation, points tracking

## Points System

- **Win**: 3 points
- **Draw**: 1 point
- **Loss**: 0 points

Tiebreakers (in order):
1. Total points
2. Goal difference (goals_for - goals_against)
3. Goals scored (goals_for)

## Database Models

### LogMatch
Tracks individual matches between houses.

**Fields:**
- `sport` (FK to Sport) - Which sport/event
- `team1`, `team2` (FK to House) - Competing houses
- `team1_score`, `team2_score` (Integer, nullable) - Match scores
- `winner` (FK to House, nullable) - Auto-determined from scores
- `status` (CharField) - scheduled | in_progress | completed | cancelled
- `match_date` (DateTime) - When the match occurs
- `venue` (CharField) - Where the match is played
- `created_at`, `updated_at` (DateTime) - Timestamps

**Auto-Calculations:**
- When both scores are entered, automatically determines winner
- Automatically sets status to 'completed'
- Triggers leaderboard update for both teams

### LogLeaderboard
Tracks points and statistics per house per sport.

**Fields:**
- `house` (FK to House) - Which house
- `sport` (FK to Sport) - Which sport/event
- `matches_played` (Integer) - Total matches
- `wins`, `draws`, `losses` (Integer) - Match results
- `goals_for`, `goals_against` (Integer) - Goal statistics
- `goal_difference` (Integer) - Auto-calculated
- `points` (Integer) - Total points (3 × wins + 1 × draws)

**Unique Together:** (house, sport)

**Methods:**
- `recalculate_stats()` - Recounts all completed matches for this house/sport

## API Endpoints

### Admin Endpoints (Requires IsAdminUser)

#### 1. Create Match
```
POST /api/log/admin/matches/create/
```

**Body:**
```json
{
  "sport": 1,
  "team1": 1,
  "team2": 2,
  "match_date": "2025-02-15T14:00:00Z",
  "venue": "Main Field"
}
```

**Response (201):**
```json
{
  "id": 1,
  "sport": 1,
  "sport_name": "Cricket",
  "team1": 1,
  "team1_name": "Red House",
  "team2": 2,
  "team2_name": "Blue House",
  "team1_score": null,
  "team2_score": null,
  "winner": null,
  "winner_name": null,
  "status": "scheduled",
  "match_date": "2025-02-15T14:00:00Z",
  "venue": "Main Field",
  "created_at": "2025-02-01T10:00:00Z",
  "updated_at": "2025-02-01T10:00:00Z"
}
```

**Requirements:**
- Houses must be finalized (`houses_finalized = True`)
- Cannot create match between same house
- Sport must be LOG type

---

#### 2. List Matches
```
GET /api/log/admin/matches/
```

**Query Params (all optional):**
- `sport` - Filter by sport ID
- `house` - Filter by house ID (either team1 or team2)
- `status` - Filter by status (scheduled, in_progress, completed, cancelled)

**Response (200):**
```json
[
  {
    "id": 1,
    "sport_name": "Cricket",
    "team1_name": "Red House",
    "team2_name": "Blue House",
    "team1_score": 245,
    "team2_score": 230,
    "winner_name": "Red House",
    "status": "completed",
    "match_date": "2025-02-15T14:00:00Z",
    "venue": "Main Field"
  }
]
```

---

#### 3. Update Match
```
PUT /api/log/admin/matches/<match_id>/
PATCH /api/log/admin/matches/<match_id>/
```

**Body (partial update allowed):**
```json
{
  "venue": "Secondary Field",
  "match_date": "2025-02-16T14:00:00Z",
  "status": "in_progress"
}
```

**Restrictions:**
- Cannot change `sport`, `team1`, or `team2` after creation
- Use separate endpoint for score updates

---

#### 4. Update Match Result
```
POST /api/log/admin/matches/<match_id>/result/
```

**Body:**
```json
{
  "team1_score": 3,
  "team2_score": 2
}
```

**Response (200):**
```json
{
  "msg": "Match result updated successfully",
  "match": {
    "id": 1,
    "team1_score": 3,
    "team2_score": 2,
    "winner": 1,
    "winner_name": "Red House",
    "status": "completed"
  }
}
```

**Auto-Actions:**
- Determines winner based on scores
- Sets status to 'completed'
- Updates leaderboard for both houses
- Recalculates points, wins/draws/losses, goal difference

**Validations:**
- Scores must be integers
- Scores cannot be negative
- Both scores required

---

#### 5. Delete Match
```
DELETE /api/log/admin/matches/<match_id>/delete/
```

**Response (200):**
```json
{
  "msg": "Match deleted successfully. Leaderboard updated."
}
```

**Auto-Actions:**
- Recalculates leaderboard for both teams
- Removes match from all statistics

---

### User Endpoints (Requires IsAuthenticated)

#### 1. Get Schedule
```
GET /api/log/schedule/
```

**Query Params (all optional):**
- `sport` - Filter by sport ID
- `house` - Filter by house ID
- `status` - Filter by status (default: excludes cancelled)

**Response (200):**
```json
[
  {
    "id": 1,
    "sport_name": "Cricket",
    "team1_name": "Red House",
    "team2_name": "Blue House",
    "team1_score": 3,
    "team2_score": 2,
    "winner_name": "Red House",
    "status": "completed",
    "match_date": "2025-02-15T14:00:00Z",
    "venue": "Main Field"
  },
  {
    "id": 2,
    "sport_name": "Football",
    "team1_name": "Green House",
    "team2_name": "Yellow House",
    "team1_score": null,
    "team2_score": null,
    "winner_name": null,
    "status": "scheduled",
    "match_date": "2025-02-20T16:00:00Z",
    "venue": "Football Ground"
  }
]
```

---

#### 2. Get Overall Leaderboard
```
GET /api/log/leaderboard/
```

**Response (200):**
```json
[
  {
    "sport": {
      "id": 1,
      "name": "Cricket",
      "event_type": "LOG"
    },
    "standings": [
      {
        "id": 1,
        "house": 1,
        "house_name": "Red House",
        "sport": 1,
        "sport_name": "Cricket",
        "matches_played": 3,
        "wins": 2,
        "draws": 1,
        "losses": 0,
        "goals_for": 450,
        "goals_against": 420,
        "goal_difference": 30,
        "points": 7
      },
      {
        "house_name": "Blue House",
        "matches_played": 3,
        "wins": 1,
        "draws": 1,
        "losses": 1,
        "points": 4
      }
    ]
  },
  {
    "sport": {
      "id": 2,
      "name": "Football"
    },
    "standings": [...]
  }
]
```

**Ordering:**
1. Points (descending)
2. Goal difference (descending)
3. Goals for (descending)

---

#### 3. Get Leaderboard by Sport
```
GET /api/log/leaderboard/<sport_id>/
```

**Response (200):**
```json
{
  "sport": {
    "id": 1,
    "name": "Cricket",
    "event_type": "LOG"
  },
  "standings": [
    {
      "house_name": "Red House",
      "matches_played": 3,
      "wins": 2,
      "draws": 1,
      "losses": 0,
      "points": 7,
      "goal_difference": 30
    }
  ]
}
```

---

## Workflow

### Setting Up Matches

1. **Admin finalizes houses** (via `/api/log/admin/finalize-houses/`)
2. **Admin creates matches** for each sport
   - 4 houses × round-robin = 6 matches per sport
   - House 1 vs 2, 1 vs 3, 1 vs 4, 2 vs 3, 2 vs 4, 3 vs 4
3. **Users view schedule** at `/api/log/schedule/`

### During Competition

1. **Admin updates match status** to `in_progress` when match starts
2. **Admin enters scores** when match completes
   - System auto-determines winner
   - System auto-updates leaderboard
3. **Users check live leaderboard** at `/api/log/leaderboard/`

### After Competition

1. **All matches completed**
2. **Leaderboard shows final standings**
3. **Admin can delete/edit matches** if needed (triggers recalculation)

---

## Auto-Calculation Logic

### Winner Determination (in LogMatch.save())
```python
if self.team1_score is not None and self.team2_score is not None:
    if self.team1_score > self.team2_score:
        self.winner = self.team1
    elif self.team2_score > self.team1_score:
        self.winner = self.team2
    else:
        self.winner = None  # Draw
    
    self.status = 'completed'
    self.update_leaderboard()
```

### Leaderboard Update (in LogLeaderboard.recalculate_stats())
```python
matches = LogMatch.objects.filter(
    models.Q(team1=self.house) | models.Q(team2=self.house),
    sport=self.sport,
    status='completed'
)

for match in matches:
    if match.winner == self.house:
        wins += 1
        points += 3
    elif match.winner is None:
        draws += 1
        points += 1
    else:
        losses += 1
    
    # Track goals
    if match.team1 == self.house:
        goals_for += match.team1_score
        goals_against += match.team2_score
    else:
        goals_for += match.team2_score
        goals_against += match.team1_score

goal_difference = goals_for - goals_against
```

---

## Testing

Use `test_match_apis.py` to test all endpoints:

1. **Get admin token:**
```bash
POST /api/auth/jwt/create/
Body: {"username": "admin", "password": "admin123"}
```

2. **Update script with token**
3. **Run tests:**
```bash
python test_match_apis.py
```

---

## Frontend Integration

### Admin Pages Needed

1. **Match Management** (`/admin/log/matches`)
   - Create new matches
   - Edit match details
   - Enter scores
   - Delete matches

2. **Schedule View** (`/admin/log/schedule`)
   - View all matches
   - Filter by sport/house/status

### User Pages Needed

1. **Schedule** (`/log/schedule`)
   - View upcoming and past matches
   - Filter by sport/house

2. **Leaderboard** (`/log/leaderboard`)
   - View standings for all sports
   - Click sport to see detailed view

---

## Error Handling

### Common Errors

1. **Cannot create match - houses not finalized**
   - Ensure `houses_finalized = True` in settings

2. **Cannot change teams after creation**
   - Delete and recreate match if needed

3. **Invalid scores**
   - Must be non-negative integers
   - Both scores required

4. **Leaderboard not updating**
   - Match must have status='completed'
   - Check that scores are entered

---

## Database Queries

### Get matches for a house
```python
LogMatch.objects.filter(
    models.Q(team1=house) | models.Q(team2=house)
)
```

### Get completed matches
```python
LogMatch.objects.filter(status='completed')
```

### Get leaderboard ordered by points
```python
LogLeaderboard.objects.filter(sport=sport).order_by(
    '-points', '-goal_difference', '-goals_for'
)
```

---

## Summary

✅ **9 API endpoints** created (5 admin, 3 user, 1 shared)
✅ **Auto-calculations** for winner, points, statistics
✅ **Atomic updates** - leaderboard always in sync with matches
✅ **Flexible filtering** - by sport, house, status
✅ **Comprehensive validation** - prevents invalid data
✅ **Complete documentation** with examples

**Next Steps:**
1. Create admin frontend for match management
2. Create user frontend for schedule and leaderboard
3. Test complete workflow with real data
