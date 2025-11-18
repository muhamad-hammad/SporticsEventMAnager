from django.shortcuts import render
from rest_framework import viewsets, status,permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import (
    Player, Sport, PlayerSportRegistration,
    Team, House, Courts, Booking
)
from .serializers import (
    PlayerSerializer, SportSerializer,
    PlayerSportRegistrationSerializer, TeamSerializer,
    HouseSerializer, CourtSerializer, BookingSerializer
)





# Create your views here.

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




class CreateBooking(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Booking request submitted! Waiting for admin approval."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        # Get user's bookings
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
