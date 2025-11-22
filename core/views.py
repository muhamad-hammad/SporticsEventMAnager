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
from .models import (
    Player, Sport, PlayerSportRegistration, SportRegistration,
    Team, House, Courts, Booking, TeamRegistration
)
from .serializers import (
    PlayerSerializer, SportSerializer,
    PlayerSportRegistrationSerializer, TeamSerializer,
    HouseSerializer, CourtSerializer, BookingSerializer, TeamRegistrationSerializer
    ,AvailableSlotSerializer,UserSerializer,SportRegistrationSerializer, SportDetailSerializer
)





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
    """List all Olympiad teams"""
    serializer_class = TeamRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TeamRegistration.objects.select_related("sport", "sport_registration", "captain").prefetch_related("players")


class ApproveTeamRegistrationAPIView(APIView):
    """Admin approves Olympiad team"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, team_id):
        team = get_object_or_404(TeamRegistration, id=team_id)
        team.approved = True
        team.save()
        return Response({"detail": "Team registration approved"})
    

class SportDetailListAPIView(generics.ListAPIView):
    queryset = Sport.objects.all()
    serializer_class = SportDetailSerializer
    permission_classes = [IsAuthenticated]  # or AllowAny if public