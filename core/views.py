from django.shortcuts import render
from rest_framework import viewsets, status,permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db import transaction
from django.db import models
from datetime import datetime, time, timedelta
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework import generics
from rest_framework.decorators import action
from .models import (
    DraftPick, Notification, Player, PlayerRegistration, Sport, PlayerSportRegistration, SportRegistration,
    Team, House, Courts, Booking, TeamRegistration, Match, HouseProposal, HouseCaptain, User, SportCaptainDetail, DraftSession, LogModuleSettings, LogMatch, LogLeaderboard, LogSportWinner, LogConclusion
)
from .serializers import (
    PlayerRegistrationSerializer, PlayerSerializer, SportSerializer,
    PlayerSportRegistrationSerializer, TeamSerializer,
    HouseSerializer, CourtSerializer, BookingSerializer, TeamRegistrationSerializer, MatchSerializer
    ,AvailableSlotSerializer,UserSerializer,SportRegistrationSerializer, SportDetailSerializer, HouseProposalSerializer,
    DraftSessionSerializer, DraftPickSerializer, LogModuleSettingsSerializer, LogMatchSerializer, LogLeaderboardSerializer, LogSportWinnerSerializer, LogConclusionSerializer
)


# Custom permission class for admin role
class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


# Create your views here.

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SportViewSet(viewsets.ModelViewSet):
    queryset = Sport.objects.all()
    serializer_class = SportSerializer

class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer



@api_view(["GET"])
def get_courts(request):
    courts = Courts.objects.all()
    serializer = CourtSerializer(courts, many=True)
    return Response(serializer.data)



class RegisterPlayer(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlayerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)



class RegisterSportView(APIView):
    def post(self, request):
        player = Player.objects.get(user=request.user)
        sport_id = request.data.get("sport_id")

        # Check sport exists
        try:
            sport = Sport.objects.get(id=sport_id)
        except Sport.DoesNotExist:
            return Response({"error": "Sport not found"}, status=404)

        # Create registration
        reg, created = PlayerSportRegistration.objects.get_or_create(
            player=player, sport=sport
        )

        if not created:
            return Response({"message": "Already registered"}, status=200)

        return Response(PlayerSportRegistrationSerializer(reg).data, status=201)






def _generate_hourly_slots(start_hour: int, end_hour: int):
    """Yield (start_time, end_time) pairs as time objects for each 1-hour slot."""
    for h in range(start_hour, end_hour):
        # Handle the case where h + 1 would be 24 (invalid for time())
        end_h = (h + 1) % 24 if h + 1 == 24 else h + 1
        yield (time(h, 0), time(end_h, 0))

class AvailableSlots(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, court_id):
        """
        GET /api/courts/<court_id>/available-slots/?date=YYYY-MM-DD[&start_hour=0&end_hour=24]
        Returns hourly slots between start_hour and end_hour (defaults to 0-24).
        """
        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"error": "date query param required (YYYY-MM-DD)."}, status=400)
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        # default to full day (0..24). You can limit with query params.
        try:
            start_hour = int(request.query_params.get("start_hour", 0))
            end_hour = int(request.query_params.get("end_hour", 24))
        except ValueError:
            return Response({"error": "start_hour and end_hour must be integers."}, status=400)

        if not (0 <= start_hour < end_hour <= 24):
            return Response({"error": "start_hour/end_hour must be within 0..24 and start < end."}, status=400)

        court = get_object_or_404(Courts, id=court_id)

        # fetch bookings for court & date
        bookings = Booking.objects.filter(court=court, date=selected_date, status__in=['approved', 'pending'])

        slots = []
        for s, e in _generate_hourly_slots(start_hour, end_hour):
            # check overlap with any booking
            overlap = bookings.filter(start_time__lt=e, end_time__gt=s).exists()
            slots.append({
                "start_time": s.strftime("%H:%M"),
                "end_time": e.strftime("%H:%M"),
                "is_available": not overlap
            })

        return Response({
            "court": court.court_name,
            "date": selected_date,
            "slots": slots
        })


class CreateBooking(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST /api/book-slot/
        Body: { "court": int, "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM" }
        """
        data = request.data.copy()
        serializer = BookingSerializer(data=data)
        # basic validation (end > start) happens in serializer.validate
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        court = serializer.validated_data["court"]
        date = serializer.validated_data["date"]
        start_time = serializer.validated_data["start_time"]
        end_time = serializer.validated_data["end_time"]
       
        # Use transaction to reduce race-window and re-check overlaps inside transaction
        with transaction.atomic():
            # Re-check overlap under transaction
            overlapping = Booking.objects.select_for_update().filter(
                court=court,
                date=date,
                status__in=['approved', 'pending'],  # <-- ignore rejected bookings
                start_time__lt=end_time,
                end_time__gt=start_time
            ).exists()

            if overlapping:
                return Response({"error": "This time slot is already booked. Please choose a different time."},
                                status=status.HTTP_400_BAD_REQUEST)

            # safe to create
            booking = serializer.save(user=request.user)

        return Response({
            "message": "Booking confirmed!",
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)
class BulkBookCourt(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST /api/book-slots-bulk/
        Body: { 
            "court": int, 
            "date": "YYYY-MM-DD", 
            "bookings": [
                { "start_time": "HH:MM", "end_time": "HH:MM" },
                ...
            ] 
        }
        """
        court_id = request.data.get("court")
        date_str = request.data.get("date")
        bookings_data = request.data.get("bookings", [])

        if not bookings_data:
            return Response({"error": "No bookings provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            court = Courts.objects.get(id=court_id)
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except (Courts.DoesNotExist, ValueError):
            return Response({"error": "Invalid court or date"}, status=status.HTTP_400_BAD_REQUEST)

        created_bookings = []

        try:
            with transaction.atomic():
                for booking_data in bookings_data:
                    start_time = booking_data.get("start_time")
                    end_time = booking_data.get("end_time")

                    # Prepare data for serializer
                    data = {
                        "court": court.id,
                        "date": date,
                        "start_time": start_time,
                        "end_time": end_time
                    }

                    serializer = BookingSerializer(data=data)
                    if not serializer.is_valid():
                        raise ValueError(str(serializer.errors))

                    # Check overlap
                    overlapping = Booking.objects.select_for_update().filter(
                        court=court,
                        date=date,
                        status__in=['approved', 'pending'],
                        start_time__lt=end_time,
                        end_time__gt=start_time
                    ).exists()

                    if overlapping:
                        raise ValueError(f"Time slot {start_time}-{end_time} is already booked.")

                    # Create booking
                    booking = serializer.save(user=request.user)
                    created_bookings.append(booking)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": f"{len(created_bookings)} bookings confirmed!",
            "bookings": BookingSerializer(created_bookings, many=True).data
        }, status=status.HTTP_201_CREATED)



class MyBookings(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(user=user).order_by('-created_at')
        data = BookingSerializer(bookings, many=True).data
        return Response(data)


class GetBooking(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        # optional: only owner or staff can view
        if booking.user != request.user and not request.user.is_staff:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        return Response(BookingSerializer(booking).data)


class CalculateCost(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST /api/calculate-cost/
        Body: { "court_id": int, "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM" }
        Returns estimated total cost (server side).
        """
        court_id = request.data.get("court_id")
        date_str = request.data.get("date")
        start_str = request.data.get("start_time")
        end_str = request.data.get("end_time")
        if not all([court_id, date_str, start_str, end_str]):
            return Response({"error": "court_id, date, start_time and end_time are required"},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            court = Courts.objects.get(id=court_id)
        except Courts.DoesNotExist:
            return Response({"error": "Court not found"}, status=404)
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
            start_time = datetime.strptime(start_str, "%H:%M").time()
            end_time = datetime.strptime(end_str, "%H:%M").time()
        except ValueError:
            return Response({"error": "Invalid date/time format"}, status=400)

        if end_time <= start_time:
            return Response({"error": "end_time must be after start_time"}, status=400)

        start_dt = datetime.combine(date, start_time)
        end_dt = datetime.combine(date, end_time)
        seconds = (end_dt - start_dt).total_seconds()
        hours = Decimal(seconds) / Decimal(3600)
        total_cost = (hours * court.hourly_rate).quantize(Decimal("0.01"))

        return Response({
            "court": court.court_name,
            "hours": float(hours),
            "hourly_rate": str(court.hourly_rate),
            "total_cost": str(total_cost)
        })
    



class PendingBookings(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Not authorized"}, status=403)

        bookings = Booking.objects.filter(status='pending')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)



class AllBookings(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Not authorized"}, status=403)

        bookings = Booking.objects.all().order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)



class UpdateBookingStatus(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        if request.user.role != 'admin':
            return Response({"detail": "Not authorized"}, status=403)

        status = request.data.get('status')
        if status not in ['approved', 'rejected']:
            return Response({"detail": "Invalid status"}, status=400)

        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found"}, status=404)

        booking.status = status
        booking.save()
        return Response({"message": f"Booking {status}"})



class SportRegistrationViewSet(viewsets.ModelViewSet):
    queryset = SportRegistration.objects.all()
    serializer_class = SportRegistrationSerializer
    permission_classes = [IsAdminUser]  # only admin can set fees

class TeamRegistrationCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = TeamRegistrationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        return Response(TeamRegistrationSerializer(team).data, status=201)


class TeamRegistrationListAPIView(generics.ListAPIView):
    """List all Olympiad teams - Admin only"""
    serializer_class = TeamRegistrationSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return TeamRegistration.objects.select_related("sport", "captain").prefetch_related("players")


class ApproveTeamRegistrationAPIView(APIView):
    """Admin approves Olympiad team"""
    permission_classes = [IsAdminRole]

    def post(self, request, team_id):
        team = get_object_or_404(TeamRegistration, id=team_id)
        team.approved = True
        team.save()
        return Response({"detail": "Team registration approved"})


class SportDetailListAPIView(generics.ListAPIView):
    queryset = Sport.objects.all()
    serializer_class = SportDetailSerializer
    permission_classes = [IsAuthenticated]


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'enter_result']:
            return [IsAdminRole()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def enter_result(self, request, pk=None):
        match = self.get_object()
        score_team1 = request.data.get("score_team1")
        score_team2 = request.data.get("score_team2")
        notes = request.data.get("notes", "")
        
        # Update scores
        match.score_team1 = score_team1
        match.score_team2 = score_team2
        match.notes = notes
        match.status = "completed"
        
        # Handle winner based on event type
        if match.event_type == "LOG":
            winner_id = request.data.get("winner_id")
            if winner_id:
                match.winner_id = winner_id
        else:  # OLYMPIAD
            olympiad_match_winner_id = request.data.get("olympiad_match_winner_id")
            if olympiad_match_winner_id:
                match.olympiad_match_winner_id = olympiad_match_winner_id
        
        match.save()
        return Response(MatchSerializer(match).data)


class OlympiadMatchCreateAPIView(APIView):
    """Create Olympiad match - Admin only"""
    permission_classes = [IsAdminRole]

    def post(self, request):
        from datetime import datetime as dt
        
        data = request.data.copy()
        data['event_type'] = 'OLYMPIAD'  # Force OLYMPIAD type
        
        # Handle date/time - check if they're separate or already combined
        if 'time' in data and data['time'] and 'date' in data:
            # If separate date and time fields are provided
            try:
                date_str = data.get('date')
                time_str = data.get('time')
                # Combine date and time into datetime
                datetime_str = f"{date_str} {time_str}"
                data['date'] = datetime_str
                # Remove the separate time field
                data.pop('time', None)
            except Exception as e:
                return Response({"error": f"Invalid date/time format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MatchSerializer(data=data)
        if serializer.is_valid():
            match = serializer.save()
            return Response(MatchSerializer(match).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OlympiadMatchListAPIView(generics.ListAPIView):
    """List all Olympiad matches"""
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Match.objects.filter(event_type='OLYMPIAD').select_related(
            'sport', 'olympiad_team1', 'olympiad_team2', 'olympiad_match_winner'
        ).order_by('-date')


class OlympiadMatchDetailAPIView(APIView):
    """Get/Update/Delete Olympiad match - Admin can update/delete"""
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        match = get_object_or_404(Match, id=match_id, event_type='OLYMPIAD')
        serializer = MatchSerializer(match)
        return Response(serializer.data)

    def patch(self, request, match_id):
        if request.user.role != 'admin':
            return Response({"detail": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
        
        match = get_object_or_404(Match, id=match_id, event_type='OLYMPIAD')
        serializer = MatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, match_id):
        if request.user.role != 'admin':
            return Response({"detail": "Admin only"}, status=status.HTTP_403_FORBIDDEN)
        
        match = get_object_or_404(Match, id=match_id, event_type='OLYMPIAD')
        match.delete()
        return Response({"detail": "Match deleted"}, status=status.HTTP_204_NO_CONTENT)


class OlympiadMatchEnterResultAPIView(APIView):
    """Enter result for Olympiad match - Admin only"""
    permission_classes = [IsAdminRole]

    def patch(self, request, match_id):
        match = get_object_or_404(Match, id=match_id, event_type='OLYMPIAD')
        
        score_team1 = request.data.get("score_team1")
        score_team2 = request.data.get("score_team2")
        olympiad_match_winner_id = request.data.get("olympiad_match_winner_id")
        notes = request.data.get("notes", "")
        
        if score_team1 is not None:
            match.score_team1 = score_team1
        if score_team2 is not None:
            match.score_team2 = score_team2
        if olympiad_match_winner_id:
            # Validate winner is one of the teams
            if olympiad_match_winner_id not in [match.olympiad_team1.id, match.olympiad_team2.id]:
                return Response(
                    {"error": "Winner must be one of the competing teams"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            match.olympiad_match_winner_id = olympiad_match_winner_id
        
        match.notes = notes
        match.status = "completed"
        match.save()
        
        return Response(MatchSerializer(match).data)
    





# --------------------------
# LOG MODULE - HOUSE MANAGEMENT
# --------------------------

class GetLogSports(APIView):
    """Get list of sports available for LOG events"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        GET /api/log/sports/
        Returns sports where is_availableinLog = True
        """
        sports = Sport.objects.filter(is_availableinLog=True)
        serializer = SportSerializer(sports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProposeHouse(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        GET /api/log/house/propose/
        Returns all house proposals (admin sees all, users see their own)
        """
        if request.user.role == 'admin':
            proposals = HouseProposal.objects.all().order_by('-created_at')
        else:
            proposals = HouseProposal.objects.filter(captain=request.user).order_by('-created_at')
        
        serializer = HouseProposalSerializer(proposals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        POST /api/log/house/propose/
        Body: {
            "house_name": "string",
            "sport_captain_details": [
                {"sport_id": 1, "name": "John Doe", "roll_no": "2021001", "email": "john@example.com"},
                {"sport_id": 2, "name": "Jane Smith", "roll_no": "2021002", "email": "jane@example.com"}
            ]
        }
        """
        # Check if house proposals are allowed
        settings = LogModuleSettings.get_settings()
        
        if settings.houses_finalized:
            return Response({
                "error": "Houses have been finalized. No more proposals are accepted."
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not settings.house_proposals_open:
            return Response({
                "error": "House proposals are currently closed. Please wait for admin to open them."
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = HouseProposalSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response({
                "msg": "House proposal submitted successfully, pending admin approval",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApproveRejectHouse(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, house_id):
        """
        POST /api/log/admin/house/<house_id>/decision/
        Body: { "action": "approve" | "reject" }
        
        On approval:
        - Sets house status to 'active'
        - Assigns proposer as house captain
        - Updates proposer's role to 'captain'
        - Creates HouseCaptain record
        - Creates LOG teams for each sport with sport captains
        """
        action = request.data.get("action")
        
        try:
            proposal = HouseProposal.objects.get(house_id=house_id)
        except HouseProposal.DoesNotExist:
            return Response({"error": "House proposal not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if action == "approve":
            with transaction.atomic():
                house = proposal.house
                house.status = 'active'
                house.captain = proposal.captain
                house.save()
                
                # Update proposer's role to captain
                proposal.captain.role = 'captain'
                proposal.captain.save()
                
                # Create HouseCaptain record
                HouseCaptain.objects.get_or_create(
                    user=proposal.captain,
                    house=house
                )
                
                # Create users for sport captains and create teams
                sport_captain_details = proposal.sport_captains.all()
                
                for captain_detail in sport_captain_details:
                    # Create or get user for sport captain
                    username = captain_detail.roll_no  # Use roll_no as username
                    user, created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': captain_detail.email,
                            'role': 'captain',
                            'first_name': captain_detail.name.split()[0] if captain_detail.name else '',
                            'last_name': ' '.join(captain_detail.name.split()[1:]) if len(captain_detail.name.split()) > 1 else ''
                        }
                    )
                    
                    # If user already exists, update their role to captain if not already
                    if not created and user.role != 'captain':
                        user.role = 'captain'
                        user.save()
                    
                    # Create team for this sport
                    Team.objects.create(
                        team_name=f"{house.house_name} - {captain_detail.sport.sports_name}",
                        event_type='LOG',
                        sport=captain_detail.sport,
                        house=house,
                        created_by=request.user,
                        captain=user
                    )
                
                # Update proposal status
                proposal.status = 'approved'
                proposal.save()
                
            return Response({
                "msg": "House approved successfully",
                "house_captain": proposal.captain.username,
                "teams_created": sport_captain_details.count()
            }, status=status.HTTP_200_OK)
            
        elif action == "reject":
            with transaction.atomic():
                proposal.status = 'rejected'
                proposal.save()
                proposal.house.delete()  # This will cascade delete the proposal
                
            return Response({"msg": "House proposal rejected and removed"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid action. Use 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)


# --------------------------
# PLAYER REGISTRATION FOR LOG
# --------------------------

class RegisterForLogSport(APIView):
    """Player: Register for a LOG sport"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Check if player registration is allowed
        settings = LogModuleSettings.get_settings()
        
        if settings.registration_finalized:
            return Response({
                "error": "Player registration has been finalized. No more registrations are accepted."
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not settings.player_registration_open:
            return Response({
                "error": "Player registration is currently closed. Please wait for admin to open it."
            }, status=status.HTTP_403_FORBIDDEN)
        
        sport_id = request.data.get('sport_id')
        
        if not sport_id:
            return Response({"error": "sport_id is required"}, status=400)
        
        try:
            sport = Sport.objects.get(id=sport_id, is_availableinLog=True)
        except Sport.DoesNotExist:
            return Response({"error": "Sport not found or not available for LOG"}, status=404)
        
        # Check if already registered
        existing = PlayerRegistration.objects.filter(user=request.user, sport=sport).first()
        if existing:
            return Response({
                "error": f"Already registered for {sport.sports_name}",
                "status": existing.status
            }, status=400)
        
        # Create registration
        registration = PlayerRegistration.objects.create(
            user=request.user,
            sport=sport,
            status='pending'
        )
        
        return Response({
            "msg": f"Successfully registered for {sport.sports_name}. Awaiting admin approval.",
            "registration": PlayerRegistrationSerializer(registration).data
        }, status=201)
    
    def get(self, request):
        """Get user's LOG sport registrations"""
        registrations = PlayerRegistration.objects.filter(
            user=request.user
        ).select_related('sport')
        
        return Response(PlayerRegistrationSerializer(registrations, many=True).data)


# --------------------------
# PLAYER REGISTRATION APPROVAL
# --------------------------

class GetAllPlayerRegistrations(APIView):
    """Admin: Get all player registrations for LOG"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        registrations = PlayerRegistration.objects.filter(
            sport__is_availableinLog=True
        ).select_related('user', 'sport').order_by('-id')
        
        return Response(PlayerRegistrationSerializer(registrations, many=True).data)


class ApproveRejectPlayer(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, reg_id):
        reg = PlayerRegistration.objects.get(id=reg_id)

        action = request.data.get("action")
        reg.status = action
        reg.save()

        return Response({"msg": f"Player registration {action}"})


# --------------------------
# DRAFT SYSTEM
# --------------------------

class InitializeDraftSession(APIView):
    """Admin: Initialize draft session for a sport"""
    permission_classes = [IsAdminRole]
    
    def post(self, request, sport_id):
        try:
            sport = Sport.objects.get(id=sport_id, is_availableinLog=True)
        except Sport.DoesNotExist:
            return Response({"error": "Sport not found or not available for LOG"}, status=404)
        
        # Check if draft session already exists
        session, created = DraftSession.objects.get_or_create(
            sport=sport,
            defaults={'status': 'not_started'}
        )
        
        if not created and session.status != 'not_started':
            return Response({
                "error": f"Draft session already {session.status}",
                "session": DraftSessionSerializer(session).data
            }, status=400)
        
        return Response({
            "msg": "Draft session initialized",
            "session": DraftSessionSerializer(session).data
        })


class StartDraftSession(APIView):
    """Admin: Start the draft session"""
    permission_classes = [IsAdminRole]
    
    def post(self, request, sport_id):
        try:
            with transaction.atomic():
                # Lock the session to prevent concurrent starts
                session = DraftSession.objects.select_for_update().get(sport_id=sport_id)
                
                if session.status != 'not_started':
                    return Response({"error": f"Draft session is already {session.status}"}, status=400)
                
                # Check if there are teams and players
                teams_count = Team.objects.filter(sport_id=sport_id, event_type='LOG').count()
                players_count = PlayerRegistration.objects.filter(sport_id=sport_id, status='approved').count()
                
                if teams_count == 0:
                    return Response({"error": "No teams found for this sport"}, status=400)
                
                if players_count == 0:
                    return Response({"error": "No approved players found for this sport"}, status=400)
                
                from django.utils import timezone
                session.status = 'in_progress'
                session.started_at = timezone.now()
                session.current_round = 1
                session.current_pick_index = 0
                session.save()
                
                return Response({
                    "msg": "Draft session started",
                    "session": DraftSessionSerializer(session).data,
                    "teams_count": teams_count,
                    "players_count": players_count
                })
        except DraftSession.DoesNotExist:
            return Response({"error": "Draft session not found. Initialize first."}, status=404)


class GetDraftSession(APIView):
    """Get draft session details - restricted to house captains and admins"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, sport_id):
        # Check if user is admin or house captain
        is_admin = request.user.role == 'admin'
        is_house_captain = HouseCaptain.objects.filter(user=request.user).exists()
        
        if not is_admin and not is_house_captain:
            return Response({
                "error": "Access denied. Only house captains and admins can access the draft."
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            session = DraftSession.objects.get(sport_id=sport_id)
        except DraftSession.DoesNotExist:
            return Response({"error": "Draft session not found"}, status=404)
        
        # Get teams for this sport
        teams = Team.objects.filter(sport_id=sport_id, event_type='LOG').select_related('house', 'captain')
        
        # Get current turn info
        teams_list = list(teams)
        current_team = None
        if session.status == 'in_progress' and teams_list:
            current_team = teams_list[session.current_pick_index % len(teams_list)]
        
        # Get draft picks
        picks = DraftPick.objects.filter(
            team__sport_id=sport_id
        ).select_related('team', 'player', 'picked_by').order_by('-picked_at')
        
        # Get available players
        drafted_player_ids = DraftPick.objects.filter(
            team__sport_id=sport_id,
            status='approved'
        ).values_list('player_id', flat=True)
        
        available_players = PlayerRegistration.objects.filter(
            sport_id=sport_id,
            status='approved'
        ).exclude(id__in=drafted_player_ids).select_related('user')
        
        # Check if user is house captain and if it's their turn
        can_pick = False
        if current_team and hasattr(request.user, 'housecaptain'):
            can_pick = request.user.housecaptain.house == current_team.house
        
        return Response({
            "session": DraftSessionSerializer(session).data,
            "teams": TeamSerializer(teams, many=True).data,
            "current_team": TeamSerializer(current_team).data if current_team else None,
            "picks": DraftPickSerializer(picks, many=True).data,
            "available_players": PlayerRegistrationSerializer(available_players, many=True).data,
            "is_captain": request.user.role == 'captain',
            "can_pick": can_pick
        })


class ListDraftSessions(APIView):
    """List all draft sessions with user participation info"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        sessions = DraftSession.objects.all().select_related('sport')
        
        results = []
        for session in sessions:
            # Get teams for this sport
            teams = Team.objects.filter(sport_id=session.sport_id, event_type='LOG').select_related('house')
            teams_list = list(teams)
            
            # Check if current user is a house captain
            is_house_captain = hasattr(request.user, 'housecaptain')
            user_house = request.user.housecaptain.house if is_house_captain else None
            
            # Check if user's house has a team in this sport
            can_participate = is_house_captain and any(team.house == user_house for team in teams_list)
            
            # Check if it's user's turn
            your_turn = False
            if session.status == 'in_progress' and teams_list and is_house_captain:
                current_team = teams_list[session.current_pick_index % len(teams_list)]
                your_turn = current_team.house == user_house
            
            session_data = DraftSessionSerializer(session).data
            session_data['can_participate'] = can_participate
            session_data['your_turn'] = your_turn
            
            results.append(session_data)
        
        return Response(results)


class DraftPoolBySport(APIView):
    """List all available players for the draft for a given sport"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, sport_id):
        sport = Sport.objects.get(id=sport_id)
        players = PlayerRegistration.objects.filter(
            sport=sport, status="approved"
        ).exclude(
            id__in=DraftPick.objects.filter(
                team__sport=sport,
                status="approved"
            ).values("player_id")
        )

        return Response(PlayerRegistrationSerializer(players, many=True).data)


class PickPlayer(APIView):
    """Pick a player during draft - restricted to house captains and admins"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Check if user is admin or house captain
        is_admin = request.user.role == 'admin'
        is_house_captain = HouseCaptain.objects.filter(user=request.user).exists()
        
        if not is_admin and not is_house_captain:
            return Response({
                "error": "Access denied. Only house captains and admins can pick players."
            }, status=status.HTTP_403_FORBIDDEN)
        
        player_id = request.data.get("player_id")
        sport_id = request.data.get("sport_id")
        captain = request.user

        if not player_id or not sport_id:
            return Response({"error": "player_id and sport_id are required"}, status=400)

        # Wrap entire operation in atomic transaction with database locking
        try:
            with transaction.atomic():
                # Lock the draft session row to prevent concurrent modifications
                session = DraftSession.objects.select_for_update().get(sport_id=sport_id)
                
                if session.status != 'in_progress':
                    return Response({"error": f"Draft session is {session.status}, cannot pick players"}, status=400)

                # Verify user is a house captain
                try:
                    house_captain = captain.housecaptain
                except:
                    return Response({"error": "You are not a house captain"}, status=403)
                
                # Get the team for this house captain and sport
                try:
                    team = Team.objects.get(house=house_captain.house, sport_id=sport_id, event_type='LOG')
                except Team.DoesNotExist:
                    return Response({"error": "No team found for your house and this sport"}, status=404)
                
                # Check if it's this house captain's turn
                teams = list(Team.objects.filter(sport_id=sport_id, event_type='LOG').order_by('id'))
                if not teams:
                    return Response({"error": "No teams found"}, status=404)
                
                current_team = teams[session.current_pick_index % len(teams)]
                if current_team.house != house_captain.house:
                    return Response({"error": "It's not your house's turn to pick"}, status=403)

                # Lock the player row to prevent double-drafting
                try:
                    player = PlayerRegistration.objects.select_for_update().get(id=player_id)
                except PlayerRegistration.DoesNotExist:
                    return Response({"error": "Player not found"}, status=404)

                # Check player already drafted (with lock held)
                if DraftPick.objects.filter(player=player, status="approved").exists():
                    return Response({"error": "Player already drafted"}, status=400)

                # Count current approved players
                count = DraftPick.objects.filter(team=team, status="approved").count()
                if count >= team.sport.max_players:
                    return Response({"error": "Max players reached"}, status=400)

                # Create draft pick
                pick = DraftPick.objects.create(
                    team=team,
                    player=player,
                    picked_by=captain,
                    status="approved",  # Auto-approve during live draft
                    round_number=session.current_round,
                    pick_order=session.current_pick_index
                )

                # Update session to next pick
                session.current_pick_index += 1
                
                # Check if round is complete
                if session.current_pick_index >= len(teams) * session.current_round:
                    session.current_round += 1
                
                # Check if draft is complete (all teams full)
                all_full = all(
                    DraftPick.objects.filter(team=t, status="approved").count() >= t.sport.max_players
                    for t in teams
                )
                
                if all_full:
                    session.status = 'completed'
                    session.completed_at = datetime.now()
                
                session.save()

                return Response({
                    "msg": "Player picked successfully",
                    "pick": DraftPickSerializer(pick).data,
                    "session": DraftSessionSerializer(session).data
                })
                
        except DraftSession.DoesNotExist:
            return Response({"error": "Draft session not found"}, status=404)


class ApproveDraftPick(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pick_id):
        try:
            with transaction.atomic():
                # Lock the pick to prevent concurrent approvals
                pick = DraftPick.objects.select_for_update().get(id=pick_id)
                team = pick.team

                # Apply logic again for safety
                approved_count = DraftPick.objects.filter(team=team, status="approved").count()
                if approved_count >= team.sport.max_players:
                    return Response({"error": "Team is already full"}, status=400)

                pick.status = "approved"
                pick.save()

                return Response({"msg": "Draft pick approved"})
        except DraftPick.DoesNotExist:
            return Response({"error": "Draft pick not found"}, status=404)


class RejectDraftPick(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pick_id):
        pick = DraftPick.objects.get(id=pick_id)
        pick.status = "rejected"
        pick.save()
        return Response({"msg": "Draft pick rejected"})


class MyTeamsView(APIView):
    """
    Get teams for the logged-in user:
    - House Captain: All teams for their house
    - Player: Teams where they have been picked (approved draft picks)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if user is a house captain
        try:
            house_captain = HouseCaptain.objects.get(user=user)
            # Return all teams for this house
            teams = Team.objects.filter(house=house_captain.house).select_related('sport', 'house', 'captain')
            
            teams_data = []
            for team in teams:
                # Get all approved picks for this team
                picks = DraftPick.objects.filter(
                    team=team, 
                    status='approved'
                ).select_related('player__user').order_by('round_number', 'pick_order')
                
                players = []
                for pick in picks:
                    players.append({
                        'id': pick.player.user.id,
                        'first_name': pick.player.user.first_name,
                        'username': pick.player.user.username,
                        'email': pick.player.user.email,
                        'round': pick.round_number,
                        'pick_order': pick.pick_order
                    })
                
                teams_data.append({
                    'id': team.id,
                    'team_name': team.team_name,
                    'sport': {
                        'id': team.sport.id,
                        'sport_name': team.sport.sports_name
                    },
                    'house': {
                        'id': team.house.id,
                        'house_name': team.house.house_name
                    },
                    'captain': {
                        'id': team.captain.id,
                        'username': team.captain.username,
                        'first_name': team.captain.first_name
                    } if team.captain else None,
                    'players': players,
                    'player_count': len(players),
                    'max_players': team.sport.max_players
                })
            
            return Response({
                'role': 'house_captain',
                'house_name': house_captain.house.house_name,
                'teams': teams_data
            })
        except HouseCaptain.DoesNotExist:
            # User is a regular player - get teams where they've been picked
            picks = DraftPick.objects.filter(
                player__user=user,
                status='approved'
            ).select_related('team__sport', 'team__house', 'team__captain')
            
            teams_data = []
            for pick in picks:
                team = pick.team
                
                # Get all players in this team
                team_picks = DraftPick.objects.filter(
                    team=team,
                    status='approved'
                ).select_related('player__user').order_by('round_number', 'pick_order')
                
                players = []
                for p in team_picks:
                    players.append({
                        'id': p.player.user.id,
                        'first_name': p.player.user.first_name,
                        'username': p.player.user.username,
                        'email': p.player.user.email,
                        'round': p.round_number,
                        'pick_order': p.pick_order,
                        'is_me': p.player.user.id == user.id
                    })
                
                teams_data.append({
                    'id': team.id,
                    'team_name': team.team_name,
                    'sport': {
                        'id': team.sport.id,
                        'sport_name': team.sport.sports_name
                    },
                    'house': {
                        'id': team.house.id,
                        'house_name': team.house.house_name
                    },
                    'captain': {
                        'id': team.captain.id,
                        'username': team.captain.username,
                        'first_name': team.captain.first_name
                    } if team.captain else None,
                    'players': players,
                    'player_count': len(players),
                    'max_players': team.sport.max_players,
                    'picked_in_round': pick.round_number,
                    'picked_at': pick.picked_at
                })
            
            return Response({
                'role': 'player',
                'teams': teams_data
            })


# ======================================================
# LOG MODULE SETTINGS & ADMIN CONTROLS
# ======================================================

class GetLogModuleSettings(APIView):
    """Get current LOG module settings - accessible to all authenticated users"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        settings = LogModuleSettings.get_settings()
        serializer = LogModuleSettingsSerializer(settings)
        return Response(serializer.data)


class UpdateLogModuleSettings(APIView):
    """Update LOG module settings - admin only"""
    permission_classes = [IsAdminUser]
    
    def patch(self, request):
        settings = LogModuleSettings.get_settings()
        serializer = LogModuleSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response({
                'msg': 'Settings updated successfully',
                'settings': serializer.data
            })
        return Response(serializer.errors, status=400)


class ToggleHouseProposals(APIView):
    """Toggle house proposals on/off - admin only"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        settings = LogModuleSettings.get_settings()
        settings.house_proposals_open = not settings.house_proposals_open
        settings.updated_by = request.user
        settings.save()
        
        return Response({
            'msg': f"House proposals {'opened' if settings.house_proposals_open else 'closed'}",
            'house_proposals_open': settings.house_proposals_open
        })


class TogglePlayerRegistration(APIView):
    """Toggle player registration on/off - admin only"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        settings = LogModuleSettings.get_settings()
        settings.player_registration_open = not settings.player_registration_open
        settings.updated_by = request.user
        settings.save()
        
        return Response({
            'msg': f"Player registration {'opened' if settings.player_registration_open else 'closed'}",
            'player_registration_open': settings.player_registration_open
        })


class FinalizeHouses(APIView):
    """Finalize houses - prevents any more proposals - admin only"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        settings = LogModuleSettings.get_settings()
        
        if settings.houses_finalized:
            return Response({
                'error': 'Houses are already finalized'
            }, status=400)
        
        settings.houses_finalized = True
        settings.house_proposals_open = False  # Auto-close proposals
        settings.updated_by = request.user
        settings.save()
        
        return Response({
            'msg': 'Houses have been finalized. No more proposals will be accepted.',
            'houses_finalized': True
        })


class FinalizeRegistration(APIView):
    """Finalize player registration - prevents any more registrations - admin only"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        settings = LogModuleSettings.get_settings()
        
        if settings.registration_finalized:
            return Response({
                'error': 'Player registration is already finalized'
            }, status=400)
        
        settings.registration_finalized = True
        settings.player_registration_open = False  # Auto-close registration
        settings.updated_by = request.user
        settings.save()
        
        return Response({
            'msg': 'Player registration has been finalized. No more registrations will be accepted.',
            'registration_finalized': True
        })


# ======================
# Match & Leaderboard APIs (Admin)
# ======================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_log_match(request):
    """
    Admin endpoint to create a new LOG match.
    Requires houses to be finalized.
    """
    try:
        settings = LogModuleSettings.get_settings()
        if not settings.houses_finalized:
            return Response({
                'error': 'Houses must be finalized before creating matches'
            }, status=400)
        
        serializer = LogMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_log_matches(request):
    """
    Admin endpoint to list all LOG matches with optional filters.
    Query params: sport, house, status
    """
    try:
        matches = LogMatch.objects.all()
        
        # Filter by sport
        sport_id = request.query_params.get('sport')
        if sport_id:
            matches = matches.filter(sport_id=sport_id)
        
        # Filter by house (either house_a or house_b)
        house_id = request.query_params.get('house')
        if house_id:
            matches = matches.filter(
                models.Q(house_a_id=house_id) | models.Q(house_b_id=house_id)
            )
        
        # Filter by status
        status = request.query_params.get('status')
        if status:
            matches = matches.filter(status=status)
        
        matches = matches.order_by('scheduled_date', 'created_at')
        serializer = LogMatchSerializer(matches, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def update_log_match(request, match_id):
    """
    Admin endpoint to update match details (venue, date, status).
    Cannot change teams or sport after creation.
    """
    try:
        match = LogMatch.objects.get(id=match_id)
        
        # Prevent changing core match details
        if 'sport' in request.data or 'team1' in request.data or 'team2' in request.data:
            return Response({
                'error': 'Cannot change sport or teams after match creation'
            }, status=400)
        
        serializer = LogMatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except LogMatch.DoesNotExist:
        return Response({'error': 'Match not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_match_result(request, match_id):
    """
    Admin endpoint to update match scores and winner manually.
    Body: { "house_a_score": str, "house_b_score": str, "winner_id": int|null }
    """
    try:
        match = LogMatch.objects.get(id=match_id)
        
        house_a_score = request.data.get('house_a_score')
        house_b_score = request.data.get('house_b_score')
        winner_id = request.data.get('winner_id')
        
        # Update scores (text fields)
        if house_a_score is not None:
            match.house_a_score = str(house_a_score).strip()
        if house_b_score is not None:
            match.house_b_score = str(house_b_score).strip()
        
        # Manual winner selection
        if winner_id is not None:
            if winner_id == '' or winner_id == 'draw':
                # Draw
                match.winner = None
                match.is_draw = True
            else:
                try:
                    winner = House.objects.get(id=winner_id)
                    # Validate winner is one of the participating houses
                    if winner.id not in [match.house_a.id, match.house_b.id]:
                        return Response({
                            'error': 'Winner must be one of the participating houses'
                        }, status=400)
                    match.winner = winner
                    match.is_draw = False
                except House.DoesNotExist:
                    return Response({'error': 'House not found'}, status=400)
        
        # If scores and winner are set, mark as completed
        if match.house_a_score and match.house_b_score and (match.winner or match.is_draw):
            match.status = 'completed'
        
        match.save()  # This triggers leaderboard update
        
        serializer = LogMatchSerializer(match)
        return Response({
            'msg': 'Match result updated successfully',
            'match': serializer.data
        })
    except LogMatch.DoesNotExist:
        return Response({'error': 'Match not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_log_match(request, match_id):
    """
    Admin endpoint to delete a match.
    Updates leaderboard if match was completed.
    """
    try:
        match = LogMatch.objects.get(id=match_id)
        sport = match.sport
        house_a = match.house_a
        house_b = match.house_b
        
        match.delete()
        
        # Recalculate leaderboard for affected houses
        if house_a and sport:
            leaderboard1, _ = LogLeaderboard.objects.get_or_create(house=house_a, sport=sport)
            leaderboard1.recalculate_stats()
        
        if house_b and sport:
            leaderboard2, _ = LogLeaderboard.objects.get_or_create(house=house_b, sport=sport)
            leaderboard2.recalculate_stats()
        
        return Response({
            'msg': 'Match deleted successfully. Leaderboard updated.'
        })
    except LogMatch.DoesNotExist:
        return Response({'error': 'Match not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ======================
# Match & Leaderboard APIs (User)
# ======================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_schedule(request):
    """
    User endpoint to view match schedule.
    Query params: sport, house, status
    """
    try:
        matches = LogMatch.objects.all()
        
        # Filter by sport
        sport_id = request.query_params.get('sport')
        if sport_id:
            matches = matches.filter(sport_id=sport_id)
        
        # Filter by house
        house_id = request.query_params.get('house')
        if house_id:
            matches = matches.filter(
                models.Q(house_a_id=house_id) | models.Q(house_b_id=house_id)
            )
        
        # Filter by status (default: show all non-cancelled)
        status = request.query_params.get('status')
        if status:
            matches = matches.filter(status=status)
        else:
            matches = matches.exclude(status='cancelled')
        
        matches = matches.order_by('scheduled_date', 'created_at')
        serializer = LogMatchSerializer(matches, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_match_results(request):
    """
    User endpoint to view completed match results grouped by sport.
    Query params: sport (optional)
    """
    try:
        matches = LogMatch.objects.filter(status='completed')
        
        # Optional sport filter
        sport_id = request.query_params.get('sport')
        if sport_id:
            matches = matches.filter(sport_id=sport_id)
        
        # Group by sport
        sports = Sport.objects.filter(is_availableinLog=True)
        result = []
        
        for sport in sports:
            sport_matches = matches.filter(sport=sport).order_by('-scheduled_date')
            if sport_matches.exists():
                serializer = LogMatchSerializer(sport_matches, many=True)
                result.append({
                    'sport': SportSerializer(sport).data,
                    'matches': serializer.data
                })
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    """
    User endpoint to view overall leaderboard (total points across all sports).
    Returns houses sorted by total points.
    """
    try:
        from django.db.models import Sum, Count
        
        houses = House.objects.all()
        result = []
        
        for house in houses:
            # Aggregate stats across all sports
            stats = LogLeaderboard.objects.filter(house=house).aggregate(
                total_points=Sum('points'),
                total_wins=Sum('wins'),
                total_draws=Sum('draws'),
                total_losses=Sum('losses')
            )
            
            result.append({
                'house': HouseSerializer(house).data,
                'total_points': stats['total_points'] or 0,
                'total_wins': stats['total_wins'] or 0,
                'total_draws': stats['total_draws'] or 0,
                'total_losses': stats['total_losses'] or 0,
                'total_matches': (stats['total_wins'] or 0) + (stats['total_draws'] or 0) + (stats['total_losses'] or 0)
            })
        
        # Sort by total points descending
        result.sort(key=lambda x: x['total_points'], reverse=True)
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard_by_sport(request, sport_id):
    """
    User endpoint to view leaderboard for a specific sport.
    """
    try:
        sport = Sport.objects.get(id=sport_id, is_availableinLog=True)
        leaderboard = LogLeaderboard.objects.filter(sport=sport).order_by(
            '-points', '-goal_difference', '-goals_for'
        )
        serializer = LogLeaderboardSerializer(leaderboard, many=True)
        return Response({
            'sport': SportSerializer(sport).data,
            'standings': serializer.data
        })
    except Sport.DoesNotExist:
        return Response({'error': 'Sport not found or not a LOG sport'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# =============================================================================
# LOG CONCLUSION ENDPOINTS
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def conclude_log(request):
    """
    Admin endpoint to conclude LOG and determine champion/runner-up.
    Creates conclusion record and auto-determines sport winners.
    """
    try:
        # Check if already concluded
        existing = LogConclusion.objects.filter(is_concluded=True).first()
        if existing:
            return Response({
                'error': 'LOG has already been concluded',
                'conclusion': LogConclusionSerializer(existing).data
            }, status=400)
        
        # Create or get conclusion object
        conclusion, created = LogConclusion.objects.get_or_create(
            defaults={'is_concluded': False}
        )
        
        # Conclude LOG
        conclusion.conclude(request.user)
        
        serializer = LogConclusionSerializer(conclusion)
        return Response({
            'msg': 'LOG concluded successfully',
            'conclusion': serializer.data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_log_conclusion(request):
    """
    Get current LOG conclusion status.
    Returns conclusion if exists, otherwise null.
    """
    try:
        conclusion = LogConclusion.objects.first()
        if conclusion:
            serializer = LogConclusionSerializer(conclusion)
            return Response(serializer.data)
        return Response({'is_concluded': False, 'conclusion': None})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sport_winners(request):
    """
    Get all sport winners.
    Returns list of sport winners with tie status.
    """
    try:
        sport_winners = LogSportWinner.objects.select_related('sport', 'winner').all()
        serializer = LogSportWinnerSerializer(sport_winners, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def set_sport_winner(request, sport_id):
    """
    Admin endpoint to manually set sport winner (for tie situations).
    Body: { "winner_id": house_id }
    """
    try:
        sport = Sport.objects.get(id=sport_id, is_availableinLog=True)
        sport_winner, created = LogSportWinner.objects.get_or_create(sport=sport)
        
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response({'error': 'winner_id is required'}, status=400)
        
        winner = House.objects.get(id=winner_id)
        sport_winner.winner = winner
        sport_winner.is_tie = False
        sport_winner.manually_set = True
        sport_winner.save()
        
        serializer = LogSportWinnerSerializer(sport_winner)
        return Response({
            'msg': 'Sport winner set successfully',
            'sport_winner': serializer.data
        })
    except Sport.DoesNotExist:
        return Response({'error': 'Sport not found'}, status=404)
    except House.DoesNotExist:
        return Response({'error': 'House not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


