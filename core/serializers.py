from rest_framework import serializers
from .models import User, House, Sport, Team,Courts, CourtSlots, CourtBookings

class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = '__all__'

class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'



class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courts
        fields = "__all__"


class CourtSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtSlots
        fields = "__all__"


class CourtBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtBookings
        fields = "__all__"
