# LOG Match & Leaderboard System - Quick Start Guide

## 🚀 Quick Access URLs

### Admin Pages
- **Match Management:** `http://localhost:3000/admin/log/matches`
  - Create, edit, and delete matches
  - Update match scores
  - Filter matches

### User Pages
- **Schedule:** `http://localhost:3000/log/schedule`
  - View all matches
  - Filter by sport/house
  - Check upcoming matches

- **Leaderboard:** `http://localhost:3000/log/leaderboard`
  - View standings
  - Check statistics
  - See rankings

---

## 📋 Step-by-Step Workflow

### 1️⃣ Setup (Admin Only)
```
1. Login as admin
2. Go to /admin/log/settings
3. Click "Finalize Houses" ✓
4. Houses are now locked and ready for competition
```

### 2️⃣ Create Matches (Admin Only)
```
1. Go to /admin/log/matches
2. Click "Create New Match"
3. Fill in:
   - Sport: Cricket
   - Team 1: Red House
   - Team 2: Blue House
   - Date: 2025-02-15 14:00
   - Venue: Main Field
4. Click "Create Match" ✓
```

### 3️⃣ View Schedule (All Users)
```
1. Go to /log/schedule
2. See all upcoming matches
3. Filter by:
   - Sport (dropdown)
   - House (dropdown)
   - View mode (All/Upcoming/Results)
```

### 4️⃣ Update Scores (Admin Only)
```
1. Go to /admin/log/matches
2. Find completed match
3. Click "Score" button
4. Enter:
   - Red House Score: 245
   - Blue House Score: 230
5. Click "Update Score" ✓
6. System automatically:
   - Determines Red House as winner
   - Updates leaderboard
   - Awards 3 points to Red House
```

### 5️⃣ Check Leaderboard (All Users)
```
1. Go to /log/leaderboard
2. View standings:
   - All Sports (overall view)
   - Or click specific sport
3. See:
   - Points
   - Wins/Draws/Losses
   - Goal difference
   - Rankings with medals 🥇🥈🥉
```

---

## 🎯 Common Tasks

### Creating a Full Tournament
For 4 houses playing round-robin (each plays each other once):

**Cricket:**
- Match 1: Red vs Blue
- Match 2: Red vs Green
- Match 3: Red vs Yellow
- Match 4: Blue vs Green
- Match 5: Blue vs Yellow
- Match 6: Green vs Yellow

**Repeat for each sport** (Football, Basketball, etc.)

Total matches per sport: **6 matches**
Total matches for 3 sports: **18 matches**

---

## 📊 Understanding the Leaderboard

### Points Calculation
```
Win  = 3 points
Draw = 1 point
Loss = 0 points
```

### Example Standings
```
Rank | House        | P | W | D | L | GF | GA | GD  | Pts
-----|-------------|---|---|---|---|----|----|-----|----
🥇 1 | Red House   | 3 | 2 | 1 | 0 | 12 | 8  | +4  | 7
🥈 2 | Blue House  | 3 | 2 | 0 | 1 | 10 | 9  | +1  | 6
🥉 3 | Green House | 3 | 1 | 1 | 1 | 9  | 9  | 0   | 4
  4  | Yellow House| 3 | 0 | 0 | 3 | 5  | 10 | -5  | 0
```

**Legend:**
- P = Played
- W = Wins
- D = Draws
- L = Losses
- GF = Goals For
- GA = Goals Against
- GD = Goal Difference
- Pts = Points

---

## 🎨 Page Previews

### Admin Match Management
```
┌─────────────────────────────────────────────────────┐
│ Match Management                                     │
│ Create and manage LOG matches                        │
├─────────────────────────────────────────────────────┤
│                                                       │
│ [Create New Match] [Refresh]                        │
│                                                       │
│ Filters:                                             │
│ Sport: [All ▼]  House: [All ▼]  Status: [All ▼]    │
│                                                       │
│ ┌───────────────────────────────────────────────┐  │
│ │ Cricket | Red vs Blue | 3-2 | COMPLETED       │  │
│ │ 2025-02-15 14:00 | Main Field                  │  │
│ │ [Score] [Edit] [Delete]                        │  │
│ ├───────────────────────────────────────────────┤  │
│ │ Football | Green vs Yellow | - | SCHEDULED    │  │
│ │ 2025-02-20 16:00 | Football Ground             │  │
│ │ [Score] [Edit] [Delete]                        │  │
│ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Schedule Page
```
┌─────────────────────────────────────────────────────┐
│ Match Schedule                                       │
│ View all LOG matches and results                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│ [All Matches] [Upcoming] [Results]                  │
│                                                       │
│ Sport: [All ▼]    House: [All ▼]                    │
│                                                       │
│ ┌─────────────────────────────────────────────┐    │
│ │ Cricket                              3 matches │   │
│ ├─────────────────────────────────────────────┤    │
│ │ Red House     3  ✓ COMPLETED                │    │
│ │ Blue House    2                              │    │
│ │ 🏆 Winner: Red House                         │    │
│ │ Feb 15, 2025 2:00 PM | Main Field           │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Leaderboard Page
```
┌─────────────────────────────────────────────────────┐
│ LOG Leaderboard                                      │
│ Track house standings across all sports              │
├─────────────────────────────────────────────────────┤
│                                                       │
│ [All Sports] [Cricket] [Football] [Basketball]      │
│                                                       │
│ ┌─────────────────────────────────────────────┐    │
│ │ Cricket                          4 houses    │    │
│ ├──────┬──────────┬──┬──┬──┬──┬───┬────┬─────┤    │
│ │ Rank │ House    │P │W │D │L │GD │ Pts│      │    │
│ ├──────┼──────────┼──┼──┼──┼──┼───┼────┤      │    │
│ │🥇 1  │Red House │3 │2 │1 │0 │+4 │ 7  │      │    │
│ │🥈 2  │Blue House│3 │2 │0 │1 │+1 │ 6  │      │    │
│ │🥉 3  │Green H.  │3 │1 │1 │1 │ 0 │ 4  │      │    │
│ │  4   │Yellow H. │3 │0 │0 │3 │-5 │ 0  │      │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Tips & Best Practices

### For Admins
- ✅ Always finalize houses before creating matches
- ✅ Create all matches at once for better planning
- ✅ Update scores immediately after matches complete
- ✅ Use filters to find specific matches quickly
- ✅ Double-check scores before submitting (can't undo easily)

### For Users
- ✅ Check schedule regularly for upcoming matches
- ✅ Use filters to find your house's matches
- ✅ View leaderboard to track your house's progress
- ✅ Check goal difference for tiebreaker situations

---

## 🔧 Troubleshooting

### Can't create match
**Error:** "Houses must be finalized"
**Solution:** Go to `/admin/log/settings` → Click "Finalize Houses"

### Score not updating
**Check:**
1. Are both scores entered?
2. Are scores non-negative numbers?
3. Is match status "scheduled" or "in_progress"?

### Leaderboard not showing
**Check:**
1. Are there any completed matches?
2. Have scores been entered for matches?
3. Try refreshing the page

### Wrong winner determined
**Solution:**
- Delete match
- Recreate with correct scores
- Or contact admin to fix in database

---

## 📱 Mobile Access

All pages are responsive and work on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 💻 Laptops

Best viewed on screens 375px and larger.

---

## ⏱️ Time Estimates

### Creating Matches
- Single match: ~30 seconds
- Full round-robin (6 matches): ~3 minutes
- Full tournament (3 sports): ~10 minutes

### Updating Scores
- Single match: ~15 seconds
- Full round (3 matches): ~1 minute

### Viewing Data
- Check schedule: ~1 minute
- View leaderboard: ~2 minutes
- Filter matches: ~30 seconds

---

## 🎓 Training Checklist

### For Admins
- [ ] Login as admin
- [ ] Access match management page
- [ ] Create a test match
- [ ] Edit match details
- [ ] Enter scores
- [ ] View updated leaderboard
- [ ] Delete a match
- [ ] Use all filters

### For Users
- [ ] Login as user
- [ ] View schedule
- [ ] Filter by your house
- [ ] Check upcoming matches
- [ ] View leaderboard
- [ ] Understand points system

---

## 📞 Support Contacts

**Technical Issues:**
- Check browser console for errors
- Clear cache and reload
- Try different browser

**Data Issues:**
- Contact admin
- Reference match ID
- Provide screenshots

---

**Ready to Start?** 🚀
1. Start backend: `cd sportics_backend && python manage.py runserver`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:3000/log/schedule`

**Happy Gaming! 🏆**
