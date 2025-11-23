from django.shortcuts import render
from rest_framework import viewsets, status,permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db import transaction
from datetime import datetime, time, timedelta
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework import generics
from rest_framework.decorators import action
from .models import (
    DraftPick, Notification, Player, PlayerRegistration, Sport, PlayerSportRegistration, SportRegistration,
    Team, House, Courts, Booking, TeamRegistration, Match, HouseProposal, HouseCaptain, User, SportCaptainDetail, DraftSession
)
from .serializers import (
    PlayerRegistrationSerializer, PlayerSerializer, SportSerializer,
    PlayerSportRegistrationSerializer, TeamSerializer,
    HouseSerializer, CourtSerializer, BookingSerializer, TeamRegistrationSerializer, MatchSerializer
    ,AvailableSlotSerializer,UserSerializer,SportRegistrationSerializer, SportDetailSerializer, HouseProposalSerializer,
    DraftSessionSerializer, DraftPickSerializer
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
            session = DraftSession.objects.get(sport_id=sport_id)
        except DraftSession.DoesNotExist:
            return Response({"error": "Draft session not found. Initialize first."}, status=404)
        
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


class GetDraftSession(APIView):
    """Get draft session details"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, sport_id):
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
        
        return Response({
            "session": DraftSessionSerializer(session).data,
            "teams": TeamSerializer(teams, many=True).data,
            "current_team": TeamSerializer(current_team).data if current_team else None,
            "picks": DraftPickSerializer(picks, many=True).data,
            "available_players": PlayerRegistrationSerializer(available_players, many=True).data,
            "is_captain": request.user.role == 'captain',
            "can_pick": current_team and current_team.captain == request.user if current_team else False
        })


class ListDraftSessions(APIView):
    """List all draft sessions with user participation info"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        sessions = DraftSession.objects.all().select_related('sport')
        
        results = []
        for session in sessions:
            # Get teams for this sport
            teams = Team.objects.filter(sport_id=session.sport_id, event_type='LOG').select_related('captain')
            teams_list = list(teams)
            
            # Check if current user is a captain for this sport
            is_captain = any(team.captain == request.user for team in teams_list)
            
            # Check if it's user's turn
            your_turn = False
            if session.status == 'in_progress' and teams_list:
                current_team = teams_list[session.current_pick_index % len(teams_list)]
                your_turn = current_team.captain == request.user
            
            session_data = DraftSessionSerializer(session).data
            session_data['can_participate'] = is_captain
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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        player_id = request.data.get("player_id")
        sport_id = request.data.get("sport_id")
        captain = request.user

        if not player_id or not sport_id:
            return Response({"error": "player_id and sport_id are required"}, status=400)

        # Check draft session
        try:
            session = DraftSession.objects.get(sport_id=sport_id)
        except DraftSession.DoesNotExist:
            return Response({"error": "Draft session not found"}, status=404)
        
        if session.status != 'in_progress':
            return Response({"error": f"Draft session is {session.status}, cannot pick players"}, status=400)

        # Get captain's team
        try:
            team = Team.objects.get(house__housecaptain__user=captain, sport_id=sport_id)
        except Team.DoesNotExist:
            return Response({"error": "No team found for this captain and sport"}, status=404)
        
        # Check if it's this captain's turn
        teams = list(Team.objects.filter(sport_id=sport_id, event_type='LOG').order_by('id'))
        if not teams:
            return Response({"error": "No teams found"}, status=404)
        
        current_team = teams[session.current_pick_index % len(teams)]
        if current_team.id != team.id:
            return Response({"error": "It's not your turn to pick"}, status=403)

        try:
            player = PlayerRegistration.objects.get(id=player_id)
        except PlayerRegistration.DoesNotExist:
            return Response({"error": "Player not found"}, status=404)

        # Check player already drafted
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


class ApproveDraftPick(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pick_id):
        pick = DraftPick.objects.get(id=pick_id)
        team = pick.team

        # Apply logic again for safety
        approved_count = DraftPick.objects.filter(team=team, status="approved").count()
        if approved_count >= team.sport.max_players:
            return Response({"error": "Team is already full"}, status=400)

        pick.status = "approved"
        pick.save()

        return Response({"msg": "Draft pick approved"})


class RejectDraftPick(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pick_id):
        pick = DraftPick.objects.get(id=pick_id)
        pick.status = "rejected"
        pick.save()
        return Response({"msg": "Draft pick rejected"})
