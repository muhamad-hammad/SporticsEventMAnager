from rest_framework import serializers
from .models import (
    User, Player, Sport, PlayerSportRegistration,
    Team, TeamPlayer, House, Courts, Booking
)
from decimal import Decimal
from datetime import datetime


# -----------------------------
# USER SERIALIZER
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "department", "contact_no"]


# -----------------------------
# PLAYER SERIALIZER
# -----------------------------
class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # nested user info

    class Meta:
        model = Player
        fields = ["id", "user", "bio", "joined_at"]
        read_only_fields = ["user", "joined_at"]


# -----------------------------
# SPORT SERIALIZER
# -----------------------------
class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = "__all__"


# -----------------------------
# PLAYER SPORT REGISTRATION SERIALIZER
# -----------------------------
class PlayerSportRegistrationSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    sport = SportSerializer(read_only=True)

    class Meta:
        model = PlayerSportRegistration
        fields = "__all__"
        read_only_fields = ["approved_by_admin"]


# -----------------------------
# HOUSE SERIALIZER
# -----------------------------
class HouseSerializer(serializers.ModelSerializer):
    captain = UserSerializer(read_only=True)

    class Meta:
        model = House
        fields = "__all__"


# -----------------------------
# TEAM SERIALIZER
# -----------------------------
class TeamSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    captain = UserSerializer(read_only=True)
    house = HouseSerializer(read_only=True)
    sport = SportSerializer(read_only=True)

    class Meta:
        model = Team
        fields = "__all__"


# -----------------------------
# TEAM PLAYER SERIALIZER
# -----------------------------
class TeamPlayerSerializer(serializers.ModelSerializer):
    team = TeamSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)

    class Meta:
        model = TeamPlayer
        fields = "__all__"


# -----------------------------
# COURTS SERIALIZER
# -----------------------------
class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Courts
        fields = "__all__"




# -----------------------------
# COURT BOOKING SERIALIZER
# -----------------------------




class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    court_details = CourtSerializer(source='court', read_only=True)
    
    class Meta:
        model = Booking
        fields = ("id", "court", "user", "court_details", "date", "start_time", "end_time", "total_cost", "status", "created_at")
        read_only_fields = ("id", "user", "court_details", "total_cost", "status", "created_at")

    def validate(self, data):
        # basic time validation
        start = data.get("start_time")
        end = data.get("end_time")
        if end <= start:
            raise serializers.ValidationError("end_time must be after start_time.")
        return data

    def create(self, validated_data):
        # Calculate total cost and create booking. We expect view to call inside an atomic block.
        court = validated_data["court"]
        start_time = validated_data["start_time"]
        end_time = validated_data["end_time"]
        date = validated_data["date"]

        # compute hours as decimal hours (supports non-whole hours if needed)
        start_dt = datetime.combine(date, start_time)
        end_dt = datetime.combine(date, end_time)
        seconds = (end_dt - start_dt).total_seconds()
        hours = Decimal(seconds) / Decimal(3600)

        # total cost = hours * hourly_rate
        total_cost = (hours * court.hourly_rate).quantize(Decimal("0.01"))

        validated_data["total_cost"] = total_cost

        # set user in view: serializer.save(user=request.user)
        return super().create(validated_data)


class AvailableSlotSerializer(serializers.Serializer):
    start_time = serializers.CharField()
    end_time = serializers.CharField()
    is_available = serializers.BooleanField()
