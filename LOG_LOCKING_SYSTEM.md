# LOG Module Locking System Documentation

## Overview
The LOG module now has a comprehensive locking and access control system that allows administrators to control when users can propose houses, register for sports, and access the draft system.

## Features Implemented

### 1. **LogModuleSettings Model**
A singleton model that stores the state of the LOG module.

**Fields:**
- `house_proposals_open` (boolean) - Allow users to propose new houses
- `player_registration_open` (boolean) - Allow players to register for sports
- `houses_finalized` (boolean) - Houses have been finalized (permanent)
- `registration_finalized` (boolean) - Player registrations finalized (permanent)
- `updated_at` (datetime) - Last update timestamp
- `updated_by` (User) - Admin who made the last update

**Special Features:**
- Singleton pattern - only one instance exists
- `get_settings()` class method automatically creates if doesn't exist

---

## Backend API Endpoints

### User Endpoints

#### Get LOG Settings
```
GET /api/log/settings/
```
Returns current LOG module settings. Accessible to all authenticated users.

**Response:**
```json
{
    "id": 1,
    "house_proposals_open": false,
    "player_registration_open": true,
    "houses_finalized": false,
    "registration_finalized": false,
    "updated_at": "2025-11-25T10:29:30Z",
    "updated_by": 1,
    "updated_by_username": "admin"
}
```

---

### Admin Endpoints (Admin Only)

#### Update Settings (Batch)
```
PATCH /api/log/admin/settings/
```
Update multiple settings at once.

**Request Body:**
```json
{
    "house_proposals_open": true,
    "player_registration_open": true
}
```

#### Toggle House Proposals
```
POST /api/log/admin/toggle-house-proposals/
```
Toggles house proposals on/off. Cannot toggle if houses are finalized.

**Response:**
```json
{
    "msg": "House proposals opened",
    "house_proposals_open": true
}
```

#### Toggle Player Registration
```
POST /api/log/admin/toggle-player-registration/
```
Toggles player registration on/off. Cannot toggle if registration is finalized.

**Response:**
```json
{
    "msg": "Player registration opened",
    "player_registration_open": true
}
```

#### Finalize Houses
```
POST /api/log/admin/finalize-houses/
```
**⚠️ PERMANENT ACTION** - Finalizes houses and prevents any future house proposals.

**Response:**
```json
{
    "msg": "Houses have been finalized. No more proposals will be accepted.",
    "houses_finalized": true
}
```

#### Finalize Registration
```
POST /api/log/admin/finalize-registration/
```
**⚠️ PERMANENT ACTION** - Finalizes player registration and prevents any future registrations.

**Response:**
```json
{
    "msg": "Player registration has been finalized. No more registrations will be accepted.",
    "registration_finalized": true
}
```

---

## Access Control

### House Proposals (`/api/log/house/propose/`)
✅ **Allowed when:**
- `house_proposals_open = true`
- `houses_finalized = false`

❌ **Blocked when:**
- `houses_finalized = true` → "Houses have been finalized. No more proposals are accepted."
- `house_proposals_open = false` → "House proposals are currently closed. Please wait for admin to open them."

### Player Registration (`/api/log/player/register/`)
✅ **Allowed when:**
- `player_registration_open = true`
- `registration_finalized = false`

❌ **Blocked when:**
- `registration_finalized = true` → "Player registration has been finalized. No more registrations are accepted."
- `player_registration_open = false` → "Player registration is currently closed. Please wait for admin to open it."

### Draft System (All draft endpoints)
✅ **Allowed for:**
- Admins (`user.role == 'admin'`)
- House Captains (users with `HouseCaptain` record)

❌ **Blocked for:**
- Regular players
- General users

**Error Response:**
```json
{
    "error": "Access denied. Only house captains and admins can access the draft."
}
```

---

## Frontend Pages

### Admin Pages

#### `/admin/log/settings` - LOG Module Settings Control
**Features:**
- View current settings with status badges
- Toggle buttons for house proposals and player registration
- Finalize buttons with confirmation dialogs
- Visual indicators for locked states
- Last updated information

**UI Elements:**
- 🟢 Green badge = Open
- 🔴 Red badge = Closed
- 🔒 Gray badge = Finalized (permanent)

---

### User Pages

#### `/log/house-proposal` - House Proposals
**Lock Indicators:**
- **Finalized**: Shows gray locked banner - "Houses Have Been Finalized"
- **Closed**: Shows yellow warning banner - "House Proposals Currently Closed"
- **Open**: Shows "New House Proposal" button

#### `/log/register` - Player Registration
**Lock Indicators:**
- **Finalized**: Shows gray locked banner - "Player Registration Has Been Finalized"
- **Closed**: Shows yellow warning banner - "Player Registration Currently Closed"
- **Open**: Registration buttons enabled

**Button States:**
- Enabled: Blue button - "Register"
- Disabled (locked): Gray button - "Registration Closed"
- Already registered: Status-specific display

#### `/log/draft/[sportId]` - Draft Page
**Access Control:**
- Shows error page if user is not admin or house captain
- Redirects with 403 error message

---

## Workflow Examples

### Example 1: Opening LOG Event
```
1. Admin goes to /admin/log/settings
2. Click "Open Proposals" → house_proposals_open = true
3. Users can now submit house proposals at /log/house-proposal
4. Admin reviews and approves houses
5. Click "Finalize Houses" → houses_finalized = true (permanent)
6. Click "Open Registration" → player_registration_open = true
7. Players register at /log/register
8. Admin approves registrations
9. Click "Finalize Registration" → registration_finalized = true (permanent)
10. House captains can now access drafts
```

### Example 2: Temporary Close
```
1. Registration is open
2. Admin needs to pause registrations temporarily
3. Click "Close Registration" → player_registration_open = false
4. Users see "Registration Currently Closed" message
5. Fix issues/make changes
6. Click "Open Registration" → player_registration_open = true
7. Users can register again
```

---

## Database Changes

### New Model
```python
class LogModuleSettings(models.Model):
    house_proposals_open = models.BooleanField(default=False)
    player_registration_open = models.BooleanField(default=False)
    houses_finalized = models.BooleanField(default=False)
    registration_finalized = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

### Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Security

### Permission Checks
1. **ProposeHouse** - Checks settings before allowing proposal
2. **RegisterForLogSport** - Checks settings before allowing registration
3. **GetDraftSession** - Verifies user is admin or house captain
4. **PickPlayer** - Verifies user is admin or house captain

### Admin-Only Actions
- All toggle and finalize endpoints require `IsAdminUser` permission
- Frontend admin pages protected by `ProtectedRoute` with admin check

---

## Testing

Run the test script:
```bash
cd sportics_backend
python test_log_settings.py
```

This verifies:
- Model creation and singleton pattern
- Settings retrieval
- API endpoint availability

---

## Important Notes

⚠️ **Finalization is Permanent**
- Once houses are finalized, they CANNOT be un-finalized
- Once registration is finalized, it CANNOT be un-finalized
- Always confirm with users before clicking finalize buttons

✅ **Toggle vs Finalize**
- **Toggle**: Temporary on/off switch, can be changed multiple times
- **Finalize**: Permanent lock, cannot be undone

🔒 **Draft Access**
- Only house captains and admins can access draft features
- Regular players will see 403 error if they try to access draft pages
- This prevents unauthorized team building

---

## Support

If you encounter issues:
1. Check settings at `/api/log/settings/`
2. Verify user role and permissions
3. Check browser console for API errors
4. Review backend logs for detailed error messages
