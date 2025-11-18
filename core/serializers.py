from rest_framework import serializers
from .models import (
    User, Player, Sport, PlayerSportRegistration,
    Team, TeamPlayer, House, Courts, Booking
)


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
        fields = ["id", "court", "court_details", "user", "date", "start_time", "end_time", "status", "created_at"]
        read_only_fields = ["status", "created_at", "user"]

    def validate(self, data):
        court = data['court']
        date = data['date']
        start = data['start_time']
        end = data['end_time']

        # Only check for approved bookings
        if Booking.objects.filter(
            court=court,
            date=date,
            start_time__lt=end,
            end_time__gt=start,
            status='approved'
        ).exists():
            raise serializers.ValidationError("This time slot is already booked.")
        return data
