from rest_framework import serializers
from .models import (
    Player,SportRegistration, User, OlympiadPlayer, Sport, PlayerSportRegistration,
    Team, TeamPlayer, House, Courts, Booking, TeamRegistration
)
from decimal import Decimal
from datetime import datetime
from django.db import transaction


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
        fields = ["id", "user", "joined_at"]
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
#class TeamSerializer(serializers.ModelSerializer):
 #   created_by = UserSerializer(read_only=True)
  #  captain = UserSerializer(read_only=True)
   ##sport = SportSerializer(read_only=True)

#    class Meta:
 #       model = Team
  #      fields = "__all__"

#for LOG teams
class TeamSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    captain = UserSerializer(read_only=True)
    sport = SportSerializer(read_only=True)
    house = HouseSerializer(read_only=True)

    class Meta:
        model = Team
        fields = ["id", "team_name", "event_type", "sport", "house", "created_by", "captain", "created_at"]
        read_only_fields = ["created_by", "created_at"]

class SportRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SportRegistration
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



# -----------------------------
# Olympiad Player Serializer
# -----------------------------
class OlympiadPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = OlympiadPlayer
        fields = ["name", "age"]

# -----------------------------
# TeamRegistration Serializer
# -----------------------------
class TeamRegistrationSerializer(serializers.ModelSerializer):
    players = OlympiadPlayerSerializer(many=True)
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(), write_only=True, source="sport"
    )
    sport_registration_id = serializers.PrimaryKeyRelatedField(
        queryset=SportRegistration.objects.all(), write_only=True, required=False, allow_null=True, source="sport_registration"
    )
    captain = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TeamRegistration
        fields = [
            "id", "team_name", "sport_id", "sport", "sport_registration_id",
            "captain", "players", "total_fee", "approved", "created_at"
        ]
        read_only_fields = ["total_fee", "approved", "created_at", "sport"]

    def get_captain(self, obj):
        return {"id": obj.captain.id, "username": obj.captain.username}

    def validate_players(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Players must be a list.")
        for p in value:
            if "name" not in p or "age" not in p:
                raise serializers.ValidationError("Each player must include 'name' and 'age'.")
        return value

    def validate(self, data):
        sport = data.get("sport")
        players = data.get("players", [])
        if not sport:
            raise serializers.ValidationError({"sport_id": "Sport is required."})

        min_p, max_p = sport.min_players, sport.max_players
        if len(players) < min_p:
            raise serializers.ValidationError({"players": f"{sport.sports_name} requires at least {min_p} players."})
        if len(players) > max_p:
            raise serializers.ValidationError({"players": f"{sport.sports_name} allows at most {max_p} players."})
        return data

    @transaction.atomic
    def create(self, validated_data):
        players_data = validated_data.pop("players")
        sport = validated_data.pop("sport")
        sport_registration = validated_data.pop("sport_registration", None)
        request = self.context.get("request")

        if sport_registration:
            fee = sport_registration.entry_fee
        else:
            sr = SportRegistration.objects.filter(sport=sport).order_by("-id").first()
            if sr:
                fee = sr.entry_fee
                sport_registration = sr
            else:
                raise serializers.ValidationError({"sport_registration": "No registration fee found for this sport. Contact admin."})

        team = TeamRegistration.objects.create(
            sport=sport,
            sport_registration=sport_registration,
            captain=request.user,
            team_name=validated_data.get("team_name"),
            total_fee=fee
        )

        for p in players_data:
            OlympiadPlayer.objects.create(team=team, name=p["name"], age=p["age"])

        return team



class SportDetailSerializer(serializers.ModelSerializer):
    registration_fee = serializers.SerializerMethodField()

    class Meta:
        model = Sport
        fields = ['id', 'sports_name', 'status', 'registration_fee']

    def get_registration_fee(self, obj):
        # Get latest SportRegistration entry for this sport
        sr = SportRegistration.objects.filter(sport=obj).order_by('-id').first()
        if sr:
            return sr.entry_fee
        return None