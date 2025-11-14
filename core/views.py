from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view


# Create your views here.
from rest_framework import viewsets
from .models import Sport, House, Team
from .serializers import SportSerializer, HouseSerializer, TeamSerializer

class SportViewSet(viewsets.ModelViewSet):
    queryset = Sport.objects.all()
    serializer_class = SportSerializer

class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

from .models import Courts, CourtSlots, CourtBookings
from .serializers import CourtSerializer, CourtSlotSerializer, CourtBookingSerializer


@api_view(["GET"])
def get_courts(request):
    courts = Courts.objects.all()
    serializer = CourtSerializer(courts, many=True)
    return Response(serializer.data)



@api_view(["GET"])
def get_available_slots(request):
    court_id = request.GET.get("court_id")
    date = request.GET.get("date")

    slots = CourtSlots.objects.filter(court_id=court_id, date=date, is_available=True)

    serializer = CourtSlotSerializer(slots, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def book_slot(request):
    user_id = request.data.get("user_id")
    court_id = request.data.get("court_id")
    slot_id = request.data.get("slot_id")

    # 1. Ensure slot exists
    try:
        slot = CourtSlots.objects.get(slot_id=slot_id, court_id=court_id)
    except CourtSlots.DoesNotExist:
        return Response({"error": "Slot not found"}, status=400)

    # 2. Check if slot already booked
    if CourtBookings.objects.filter(court_id=court_id, slot_id=slot_id).exists():
        return Response({"error": "Slot already booked"}, status=400)

    # 3. Mark slot unavailable
    slot.is_available = False
    slot.save()

    # 4. Create booking
    booking = CourtBookings.objects.create(
        user_id=user_id,
        court_id=court_id,
        slot_id=slot_id,
        status="pending"
    )

    return Response({
        "message": "Booking successful",
        "booking_id": booking.booking_id
    })


