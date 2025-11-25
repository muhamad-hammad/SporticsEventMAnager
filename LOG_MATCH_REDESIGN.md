# LOG Match System Redesign - Manual Winner Selection

## Date: 2025-01-XX

## Overview
Redesigned the LOG match and leaderboard system to support manual winner selection instead of automatic determination. This change accommodates different sport scoring systems (goals, runs, sets, points) that cannot be directly compared as integers.

---

## Backend Changes

### 1. Models (`core/models.py`)

#### LogMatch Model
**Changed Fields:**
- `house_a_score`: `IntegerField` → `CharField(max_length=50)`
  - Now accepts text like "3 goals", "156/10 runs", "21-19, 21-18" (sets)
- `house_b_score`: `IntegerField` → `CharField(max_length=50)`
  - Same as above
- Added `is_draw`: `BooleanField` to explicitly track draw status

**Removed Logic:**
- Deleted auto-winner determination from `save()` method
- Previously compared integer scores to set winner automatically
- Removed auto-status change to "completed"

**New Logic:**
- Winner must be manually selected by admin
- `update_leaderboard()` still called automatically on save when status='completed'
- Leaderboard calculation remains unchanged (3 pts win, 1 pt draw, 0 pts loss)

**Migration:** `0022_alter_logmatch_house_a_score_and_more.py`

---

### 2. Views (`core/views.py`)

#### Updated Endpoint: `update_match_result`
**Location:** `/api/log/admin/matches/<match_id>/result/` (POST)

**Old Request Body:**
```json
{
  "house_a_score": 3,  // integer
  "house_b_score": 2   // integer
}
```

**New Request Body:**
```json
{
  "house_a_score": "3 goals",     // string
  "house_b_score": "2 goals",     // string
  "winner_id": 123                // house ID or null/'draw'
}
```

**Changes:**
- Removed `parseInt()` calls for scores
- Removed integer validation
- Added `winner_id` parameter (required)
- Accepts winner_id as:
  - `null` or `'draw'` → sets `is_draw=True`, `winner=None`
  - House ID → validates it's one of house_a or house_b, sets as winner
- Only sets `status='completed'` if scores AND winner are provided
- Still triggers leaderboard update automatically

**Validation:**
- Checks winner is either house_a, house_b, or null/draw
- Returns 400 error if winner is a different house

---

#### New Endpoint: `get_match_results`
**Location:** `/api/log/results/` (GET)

**Purpose:** View completed matches grouped by sport

**Query Parameters:**
- `sport` (optional): Filter by sport ID

**Response Format:**
```json
[
  {
    "sport": {
      "id": 1,
      "sports_name": "Futsal"
    },
    "matches": [
      {
        "id": 1,
        "house_a_name": "Red House",
        "house_b_name": "Blue House",
        "house_a_score": "3 goals",
        "house_b_score": "2 goals",
        "winner_name": "Red House",
        "is_draw": false,
        "scheduled_date": "2025-01-15",
        "venue": "Main Field"
      }
    ]
  }
]
```

---

#### Updated Endpoint: `get_leaderboard`
**Location:** `/api/log/leaderboard/` (GET)

**Old Response:** Per-sport leaderboards with detailed stats
```json
[
  {
    "sport": {...},
    "standings": [...]
  }
]
```

**New Response:** Overall total points across all sports
```json
[
  {
    "house": {
      "id": 1,
      "house_name": "Red House"
    },
    "total_points": 12,
    "total_wins": 4,
    "total_draws": 0,
    "total_losses": 2,
    "total_matches": 6
  }
]
```

**Changes:**
- Uses Django `Sum()` aggregation to total stats across all LogLeaderboard entries
- Sorted by `total_points` descending
- Simplified response (no per-sport breakdown)
- Existing `get_leaderboard_by_sport` endpoint unchanged for sport-specific views

---

### 3. URLs (`core/urls.py`)

**Added Route:**
```python
path("log/results/", views.get_match_results),
```

---

## Frontend Changes

### 1. Admin Match Management (`frontend/app/admin/log/matches/page.tsx`)

#### Type Updates
**Match Interface:**
```typescript
interface Match {
  house_a_score: string | null;  // was: number | null
  house_b_score: string | null;  // was: number | null
  is_draw: boolean;              // added
  // ... other fields unchanged
}
```

#### Score Form State
**Added field:**
```typescript
const [scoreData, setScoreData] = useState({
  house_a_score: '',
  house_b_score: '',
  winner_id: ''  // NEW: 'house_a', 'house_b', or 'draw'
});
```

#### Score Form UI Changes
**Old Input (Integer):**
```tsx
<input
  type="number"
  min="0"
  placeholder="Enter score"
/>
```

**New Input (Text):**
```tsx
<input
  type="text"
  placeholder="e.g., 3 goals, 156/10, 21-19"
/>
```

**New Winner Dropdown:**
```tsx
<select value={scoreData.winner_id} required>
  <option value="">Select Winner</option>
  <option value={match.house_a}>{match.house_a_name}</option>
  <option value={match.house_b}>{match.house_b_name}</option>
  <option value="draw">Draw</option>
</select>
```

#### API Call Update
**Old:**
```typescript
await api.post(`/api/log/admin/matches/${matchId}/result/`, {
  house_a_score: parseInt(scoreData.house_a_score),
  house_b_score: parseInt(scoreData.house_b_score)
});
```

**New:**
```typescript
await api.post(`/api/log/admin/matches/${matchId}/result/`, {
  house_a_score: scoreData.house_a_score,
  house_b_score: scoreData.house_b_score,
  winner_id: scoreData.winner_id === 'draw' ? null : scoreData.winner_id
});
```

---

### 2. Leaderboard Page (`frontend/app/log/leaderboard/page.tsx`)

**Complete Rewrite:** Simplified from per-sport detailed view to overall total points only

#### Old Design
- Showed multiple tables (one per sport)
- Detailed stats: Goals For, Goals Against, Goal Difference, Win %
- Sport filter buttons
- Overall summary at bottom

#### New Design
- Single table showing all houses
- Columns: Rank, House, Matches, Won, Draw, Lost, **Total Points**
- Data aggregated across all sports
- No sport filtering
- Cleaner, simpler UI focused on overall standings

#### Type Changes
**Old:**
```typescript
interface LeaderboardEntry {
  id: number;
  house_name: string;
  sport_name: string;
  matches_played: number;
  wins: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
```

**New:**
```typescript
interface OverallStanding {
  house: {
    id: number;
    house_name: string;
  };
  total_points: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  total_matches: number;
}
```

---

### 3. Results Page (`frontend/app/log/results/page.tsx`)

**NEW PAGE** - Shows completed match details grouped by sport

#### Features
- Displays all completed matches
- Grouped by sport with collapsible sections
- Shows:
  - Match date and venue
  - House names
  - Scores (text format)
  - Winner badge or "Draw" badge
- Filter by sport dropdown
- Responsive layout

#### Layout
```
┌─────────────────────────────────────┐
│ Sport: Futsal                       │
│ 3 completed matches                 │
├─────────────────────────────────────┤
│ Jan 15 • Main Field                 │
│ Red House  [3 goals - 2 goals]  Blue│
│ ✅ Red House Won                    │
├─────────────────────────────────────┤
│ Jan 16 • Field B                    │
│ Green House [2 - 2] Yellow House    │
│ ⚖️ Draw                             │
└─────────────────────────────────────┘
```

---

## Database Changes

### Migration: `0022_alter_logmatch_house_a_score_and_more.py`

**Operations:**
1. Alter field `house_a_score` from `IntegerField` to `CharField(max_length=50)`
2. Alter field `house_b_score` from `IntegerField` to `CharField(max_length=50)`

**Data Impact:**
- Existing integer scores automatically converted to strings
- e.g., `3` → `"3"`
- Existing data preserved

---

## User Workflow Changes

### Admin Workflow

#### Old Process
1. Create match with houses, sport, date, venue
2. Enter integer scores (e.g., 3, 2)
3. **Winner automatically determined** by comparing scores
4. Leaderboard auto-updated

#### New Process
1. Create match with houses, sport, date, venue
2. Enter text scores appropriate for sport:
   - Futsal: "3 goals", "2 goals"
   - Cricket: "156/10", "142/10"
   - Badminton: "21-19, 21-18", "19-21, 18-21"
3. **Manually select winner** from dropdown (House A / House B / Draw)
4. System validates winner is one of participating houses
5. Leaderboard auto-updated based on manual winner selection

#### Validation Rules
- Scores must be provided (required text fields)
- Winner must be selected (required dropdown)
- Winner must be either house_a, house_b, or draw
- Cannot set winner to a different house

---

## Why This Change?

### Problem with Old System
Different sports have incompatible scoring systems:
- **Futsal:** Goals (3-2) → higher is better
- **Cricket:** Runs + wickets (156/10 vs 142/10) → complex comparison
- **Badminton:** Sets + points (21-19, 21-18) → best of 3 sets
- **Basketball:** Points (78-65) → higher is better
- **Volleyball:** Sets (3-2) → best of 5 sets

Cannot directly compare these as integers!

### Solution
- Store scores as descriptive text (flexible for any format)
- Admin manually declares winner based on sport-specific rules
- System still auto-calculates leaderboard points (3/1/0)
- Preserves detailed score information for record-keeping

---

## Testing Checklist

### Backend
- [x] Migration applies without errors
- [x] Django system check passes
- [x] Can create match with text scores
- [x] Can update match result with winner selection
- [x] Winner validation works (rejects invalid house IDs)
- [x] Draw selection works (winner=null, is_draw=true)
- [x] Leaderboard updates correctly
- [x] Overall leaderboard aggregates across sports
- [x] Results endpoint returns completed matches grouped by sport

### Frontend
- [ ] Admin can enter text scores
- [ ] Winner dropdown shows correct houses
- [ ] Draw option works
- [ ] Validation prevents invalid submissions
- [ ] Leaderboard shows total points
- [ ] Results page displays match details
- [ ] All pages load without errors

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Access |
|--------|----------|---------|--------|
| POST | `/api/log/admin/matches/` | Create match | Admin |
| GET | `/api/log/admin/matches/` | List all matches | Admin |
| PUT | `/api/log/admin/matches/<id>/` | Update match details | Admin |
| **POST** | `/api/log/admin/matches/<id>/result/` | **Update score & winner** | Admin |
| DELETE | `/api/log/admin/matches/<id>/delete/` | Delete match | Admin |
| GET | `/api/log/schedule/` | View match schedule | User |
| **GET** | `/api/log/results/` | **View completed matches** | User |
| **GET** | `/api/log/leaderboard/` | **Overall total points** | User |
| GET | `/api/log/leaderboard/<sport_id>/` | Per-sport standings | User |

---

## Files Modified

### Backend
1. `core/models.py` - LogMatch field types and save logic
2. `core/views.py` - update_match_result, get_leaderboard, get_match_results
3. `core/urls.py` - Added results route
4. `core/migrations/0022_*.py` - Field type changes

### Frontend
1. `frontend/app/admin/log/matches/page.tsx` - Score form UI and logic
2. `frontend/app/log/leaderboard/page.tsx` - Complete redesign (total points)
3. `frontend/app/log/results/page.tsx` - NEW page for match details

---

## Breaking Changes

### API Response Changes
1. `GET /api/log/leaderboard/` response format completely changed
   - Old: Array of sport leaderboards with detailed stats
   - New: Array of houses with total points

### API Request Changes
1. `POST /api/log/admin/matches/<id>/result/` now requires:
   - `winner_id` parameter (was auto-determined)
   - Scores as strings (was integers)

### Data Type Changes
1. `LogMatch.house_a_score` and `house_b_score`:
   - Old: Integer (e.g., 3)
   - New: String (e.g., "3 goals")

---

## Migration Notes

### For Existing Data
- Integer scores automatically convert to strings
- No data loss
- Existing matches will have numeric string scores (e.g., "3", "2")
- Winners already set will remain unchanged

### For New Matches
- Admins should enter descriptive scores (e.g., "3 goals" not just "3")
- Winner must be manually selected
- Cannot rely on automatic winner determination

---

## Future Enhancements

### Potential Additions
1. **Score Templates:** Predefined formats per sport
   - Futsal: "[X] goals"
   - Cricket: "[X]/[Y] in [Z] overs"
   - Badminton: "[Set scores]"

2. **Per-Sport Results View:** Dedicated page per sport with sport-specific stats

3. **Historical Comparison:** Compare scores across seasons

4. **Match Highlights:** Add notes/description field for notable moments

5. **Photo Upload:** Attach match photos to results

---

## Rollback Plan

If issues arise, rollback steps:

1. **Database:** Restore from backup or run reverse migration
   ```bash
   python manage.py migrate core 0021
   ```

2. **Code:** Revert commits
   ```bash
   git revert <commit-hash>
   ```

3. **Frontend:** Restore old leaderboard page from `page_old.tsx`

---

## Contact
For questions or issues, contact the development team.
