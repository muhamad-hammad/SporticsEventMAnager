# LOG Match System - Field Name Reference

## Field Name Mapping

The LogMatch model, Sport model, and House model use specific field names. Use this reference when working with the API:

### Match Fields

| Description | Correct Field Name | ❌ Not Used |
|------------|-------------------|-------------|
| Match date/time | `scheduled_date` | ~~match_date~~ |
| First house | `house_a` | ~~team1~~ |
| Second house | `house_b` | ~~team2~~ |
| First house name | `house_a_name` (serializer) | ~~team1_name~~ |
| Second house name | `house_b_name` (serializer) | ~~team2_name~~ |
| First house score | `house_a_score` | ~~team1_score~~ |
| Second house score | `house_b_score` | ~~team2_score~~ |
| Sport name | `sport_name` (serializer) | - |
| Winner name | `winner_name` (serializer) | - |

### Sport Model Fields

| Description | Correct Field Name | ❌ Not Used |
|------------|-------------------|-------------|
| Sport name | `sports_name` | ~~name~~ |
| Is LOG event | `is_availableinLog` | ~~event_type~~ |
| Is Olympiad event | `is_availableinOlympiad` | - |
| Minimum players | `min_players` | - |
| Maximum players | `max_players` | - |

### House Model Fields

| Description | Correct Field Name | ❌ Not Used |
|------------|-------------------|-------------|
| House name | `house_name` | ~~name~~ |
| Captain | `captain` | - |
| Status | `status` | - |

### API Request/Response Examples

#### Create Match
```json
POST /api/log/admin/matches/create/

{
  "sport": 1,
  "house_a": 1,           // ✅ Use house_a
  "house_b": 2,           // ✅ Use house_b  
  "scheduled_date": "2025-02-15T14:00:00Z",  // ✅ Use scheduled_date
  "venue": "Main Field"
}
```

#### Update Score
```json
POST /api/log/admin/matches/<id>/result/

{
  "house_a_score": 3,     // ✅ Use house_a_score
  "house_b_score": 2      // ✅ Use house_b_score
}
```

#### Match Response
```json
{
  "id": 1,
  "sport": 1,
  "sport_name": "Cricket",
  "house_a": 1,
  "house_a_name": "Red House",
  "house_b": 2,
  "house_b_name": "Blue House",
  "house_a_score": 3,
  "house_b_score": 2,
  "winner": 1,
  "winner_name": "Red House",
  "status": "completed",
  "scheduled_date": "2025-02-15T14:00:00Z",
  "venue": "Main Field",
  "created_at": "2025-01-20T10:00:00Z",
  "updated_at": "2025-01-20T15:00:00Z"
}
```

### TypeScript Interfaces

```typescript
// Sport Interface
interface Sport {
  id: number;
  sports_name: string;              // ✅ Correct (not name)
  is_availableinLog: boolean;       // ✅ Correct (not event_type)
  is_availableinOlympiad: boolean;
  min_players: number;
  max_players: number;
  status: string;
}

// House Interface
interface House {
  id: number;
  house_name: string;               // ✅ Correct (not name)
  captain: number | null;
  status: string;
}

// Match Interface
interface Match {
  id: number;
  sport: number;
  sport_name: string;
  house_a: number;                  // ✅ Correct
  house_a_name: string;             // ✅ Correct
  house_b: number;                  // ✅ Correct
  house_b_name: string;             // ✅ Correct
  house_a_score: number | null;     // ✅ Correct
  house_b_score: number | null;     // ✅ Correct
  winner: number | null;
  winner_name: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;           // ✅ Correct (not match_date)
  venue: string;
  created_at: string;
  updated_at: string;
}
```

### Form Data

```typescript
// Create/Edit Form
const [formData, setFormData] = useState({
  sport: '',
  house_a: '',           // ✅ Correct
  house_b: '',           // ✅ Correct
  scheduled_date: '',    // ✅ Correct
  venue: ''
});

// Score Form
const [scoreData, setScoreData] = useState({
  house_a_score: '',     // ✅ Correct
  house_b_score: ''      // ✅ Correct
});
```

## Why These Names?

The `LogMatch` model distinguishes between:
- **Houses** (`house_a`, `house_b`) - The competing houses
- **Teams** (`team_a`, `team_b`) - Optional FK to Team model for roster reference

This allows the system to:
1. Track which houses are competing
2. Optionally reference team rosters if needed
3. Maintain clear separation between house entity and team roster

## Database Model

```python
class LogMatch(models.Model):
    sport = models.ForeignKey(Sport, ...)
    house_a = models.ForeignKey(House, ...)  # The competing house
    house_b = models.ForeignKey(House, ...)  # The competing house
    
    # Optional team references for roster
    team_a = models.ForeignKey(Team, null=True, blank=True, ...)
    team_b = models.ForeignKey(Team, null=True, blank=True, ...)
    
    scheduled_date = models.DateTimeField()  # When match happens
    venue = models.CharField(...)
    
    status = models.CharField(...)
    
    house_a_score = models.IntegerField(null=True, blank=True)
    house_b_score = models.IntegerField(null=True, blank=True)
    winner = models.ForeignKey(House, null=True, blank=True, ...)
    is_draw = models.BooleanField(default=False)
```

## Fixed Issues

✅ Frontend now uses correct field names
✅ Backend API accepts correct field names  
✅ No more "Cannot resolve keyword 'match_date'" errors
✅ All pages (admin/matches, log/schedule, log/leaderboard) updated

## Remember

When working with LOG matches:
- Always use `house_a` and `house_b` (not team1/team2)
- Always use `scheduled_date` (not match_date)
- Always use `house_a_score` and `house_b_score` (not team1_score/team2_score)
- Serializer provides `_name` fields for display (read-only)
