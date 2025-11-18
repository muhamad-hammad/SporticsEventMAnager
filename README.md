# Sportics Event Manager

Simple sports event management system with Django REST API backend and Next.js frontend.

## Running the Application

### Prerequisites
- Python 3.12+
- Node.js 20+
- npm 10+

### First Time Setup
Install all dependencies (backend and frontend):
```bash
pip install -r requirements.txt
cd frontend && npm install
```

Or use the setup script:
```bash
npm run setup
```

### Quick Start (Both Servers)
Run both backend and frontend servers simultaneously:
```bash
npm run dev
```
- Backend runs at: **http://127.0.0.1:8000**
- Frontend runs at: **http://localhost:3000**

### Individual Servers

#### Start Backend (Django) Only
```bash
python manage.py runserver
```
Backend runs at: **http://127.0.0.1:8000**

#### Start Frontend (Next.js) Only
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:3000**

## Features

### 1. Authentication
- Register new user
- Login with JWT tokens
- Auto token refresh

### 2. Sports Management
- View all sports
- Create new sport (name, event type: LOG/OLYMPIAD, team-based)
- Delete sport

### 3. Houses Management
- View all houses
- Create house (name, status: pending/active/inactive)
- Delete house

### 4. Teams Management
- View all teams
- Create team (name, event type, sport, optional house)
- Delete team

### 5. Courts
- View all available courts
- See location and hourly rates

### 6. Court Booking
- Book court time slots
- Select date, start time, end time
- Prevents double booking

### 7. Player Registration
- Register as a player
- Register for specific sports

## API Endpoints

### Auth
- POST `/auth/users/` - Register
- POST `/auth/jwt/create/` - Login
- POST `/auth/jwt/refresh/` - Refresh token
- GET `/auth/users/me/` - Get current user

### Resources
- GET/POST/PUT/DELETE `/api/sports/` - Sports CRUD
- GET/POST/PUT/DELETE `/api/houses/` - Houses CRUD
- GET/POST/PUT/DELETE `/api/teams/` - Teams CRUD
- GET `/api/courts/` - List courts
- POST `/api/book-slot/` - Book court (auth required)
- POST `/api/player/register/` - Register as player (auth required)
- POST `/api/register-sport/` - Register for sport (auth required)

## Tech Stack

**Backend:**
- Django 5.2.8
- Django REST Framework
- JWT Authentication (djoser + simplejwt)
- SQLite Database

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios

## Database Models

1. **User** - Custom user with roles (general/player/captain/admin)
2. **House** - Houses with captains and status
3. **Sport** - Sports with event types and team configuration
4. **Player** - Player profiles linked to users
5. **Team** - Teams linked to sports and houses
6. **Courts** - Court details with pricing
7. **Booking** - Court bookings with time slots
8. **PlayerSportRegistration** - Player-sport enrollments

## Default Accounts

Check database for existing users or register new ones.

## Notes

- All authenticated endpoints require JWT Bearer token
- CORS configured for localhost:3000
- Token refresh happens automatically on 401 errors
