from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    DraftPick, Notification, Player, PlayerRegistration,SportRegistration, User, OlympiadPlayer, Sport, PlayerSportRegistration,
    Team, TeamPlayer, House, Courts, Booking, TeamRegistration, Match, HouseProposal, SportCaptainDetail, DraftSession, LogModuleSettings,
    LogMatch, LogLeaderboard, LogSportWinner, LogConclusion, OlympiadSettings
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
        fields = ["id", "username", "email", "first_name", "role", "department", "contact_no"]



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
    sport = SportSerializer(read_only=True)
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(), write_only=True, source="sport"
    )
    captain = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TeamRegistration
        fields = [
            "id", "team_name", "sport_id", "sport",
            "captain", "players", "approved", "rejected", "rejection_reason", "created_at"
        ]
        read_only_fields = ["approved", "rejected", "rejection_reason", "created_at", "sport"]

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
        request = self.context.get("request")

        team = TeamRegistration.objects.create(
            sport=sport,
            captain=request.user,
            team_name=validated_data.get("team_name")
        )

        for p in players_data:
            OlympiadPlayer.objects.create(team=team, name=p["name"], age=p["age"])

        return team


class SportDetailSerializer(serializers.ModelSerializer):
    registration_fee = serializers.SerializerMethodField()

    class Meta:
        model = Sport
        fields = ['id', 'sports_name', 'status', 'registration_fee', 'min_players', 'max_players']

    def get_registration_fee(self, obj):
        # Get latest SportRegistration entry for this sport
        sr = SportRegistration.objects.filter(sport=obj).order_by('-id').first()
        if sr:
            return sr.entry_fee
        return None



# -----------------------------
# MATCH SERIALIZER
# -----------------------------
class MatchSerializer(serializers.ModelSerializer):
    sport = SportSerializer(read_only=True)
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(), write_only=True, source='sport'
    )
    
    class Meta:
        model = Match
        fields = "__all__"
        extra_kwargs = {
            'sport_id': {'write_only': True}
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        if instance.event_type == "LOG":
            if instance.team1:
                ret['team1'] = TeamSerializer(instance.team1).data
            if instance.team2:
                ret['team2'] = TeamSerializer(instance.team2).data
            if instance.winner:
                ret['winner'] = TeamSerializer(instance.winner).data
        else:  # OLYMPIAD
            if instance.olympiad_team1:
                ret['olympiad_team1'] = TeamRegistrationSerializer(instance.olympiad_team1).data
            if instance.olympiad_team2:
                ret['olympiad_team2'] = TeamRegistrationSerializer(instance.olympiad_team2).data
            if instance.olympiad_match_winner:
                ret['olympiad_match_winner'] = TeamRegistrationSerializer(instance.olympiad_match_winner).data
        
        return ret

    def validate(self, data):
        event_type = data.get('event_type') or (self.instance.event_type if self.instance else None)
        sport = data.get('sport') or (self.instance.sport if self.instance else None)
        
        if event_type == "LOG":
            team1 = data.get('team1') or (self.instance.team1 if self.instance else None)
            team2 = data.get('team2') or (self.instance.team2 if self.instance else None)
            
            if not team1 or not team2:
                raise serializers.ValidationError("LOG matches must have team1 and team2.")
            
            if team1 == team2:
                raise serializers.ValidationError("Team 1 and Team 2 cannot be the same.")
            
            if sport and team1.sport.id != sport.id:
                raise serializers.ValidationError(
                    f"{team1.team_name} (sport_id={team1.sport.id}) does not belong to {sport.sports_name} (sport_id={sport.id})."
                )
            
            if sport and team2.sport.id != sport.id:
                raise serializers.ValidationError(
                    f"{team2.team_name} (sport_id={team2.sport.id}) does not belong to {sport.sports_name} (sport_id={sport.id})."
                )
        
        elif event_type == "OLYMPIAD":
            olympiad_team1 = data.get('olympiad_team1') or (self.instance.olympiad_team1 if self.instance else None)
            olympiad_team2 = data.get('olympiad_team2') or (self.instance.olympiad_team2 if self.instance else None)
            
            if not olympiad_team1 or not olympiad_team2:
                raise serializers.ValidationError("OLYMPIAD matches must have olympiad_team1 and olympiad_team2.")
            
            if olympiad_team1 == olympiad_team2:
                raise serializers.ValidationError("Olympiad Team 1 and Team 2 cannot be the same.")
            
            if sport and olympiad_team1.sport.id != sport.id:
                raise serializers.ValidationError(
                    f"{olympiad_team1.team_name} (sport_id={olympiad_team1.sport.id}) does not belong to {sport.sports_name} (sport_id={sport.id})."
                )
            
            if sport and olympiad_team2.sport.id != sport.id:
                raise serializers.ValidationError(
                    f"{olympiad_team2.team_name} (sport_id={olympiad_team2.sport.id}) does not belong to {sport.sports_name} (sport_id={sport.id})."
                )
            
        return data
    








class PlayerRegistrationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    sport = SportSerializer(read_only=True)
    
    class Meta:
        model = PlayerRegistration
        fields = "__all__"




class DraftPickSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.team_name', read_only=True)
    player_name = serializers.CharField(source='player.user.username', read_only=True)
    picked_by_name = serializers.CharField(source='picked_by.username', read_only=True)
    
    class Meta:
        model = DraftPick
        fields = '__all__'


class DraftSessionSerializer(serializers.ModelSerializer):
    sport_name = serializers.CharField(source='sport.sports_name', read_only=True)
    
    class Meta:
        model = DraftSession
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"


class SportCaptainDetailSerializer(serializers.ModelSerializer):
    sport_name = serializers.CharField(source='sport.sports_name', read_only=True)
    
    class Meta:
        model = SportCaptainDetail
        fields = ['id', 'sport', 'sport_name', 'name', 'roll_no', 'email']
        read_only_fields = ['id']


class HouseProposalSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(write_only=True)
    captain = UserSerializer(read_only=True)
    sport_captains = SportCaptainDetailSerializer(many=True, read_only=True)
    sport_captain_details = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text="List of sport captain details with sport_id, name, roll_no, email"
    )
    house = HouseSerializer(read_only=True)

    class Meta:
        model = HouseProposal
        fields = ['id', 'house', 'house_name', 'captain', 'sport_captains', 'sport_captain_details', 'status', 'created_at']
        read_only_fields = ['captain', 'status', 'created_at']

    def validate_sport_captain_details(self, value):
        """Validate sport captain details"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one sport captain is required")
        
        sport_ids = []
        for captain in value:
            if 'sport_id' not in captain or 'name' not in captain or 'roll_no' not in captain or 'email' not in captain:
                raise serializers.ValidationError("Each sport captain must have sport_id, name, roll_no, and email")
            
            # Check for duplicate sports
            if captain['sport_id'] in sport_ids:
                raise serializers.ValidationError(f"Duplicate sport captain for sport ID {captain['sport_id']}")
            sport_ids.append(captain['sport_id'])
            
            # Validate sport exists and is available in LOG
            try:
                sport = Sport.objects.get(id=captain['sport_id'])
                if not sport.is_availableinLog:
                    raise serializers.ValidationError(f"Sport '{sport.sports_name}' is not available for LOG events")
            except Sport.DoesNotExist:
                raise serializers.ValidationError(f"Sport with ID {captain['sport_id']} does not exist")
        
        return value

    def create(self, validated_data):
        house_name = validated_data.pop('house_name')
        sport_captain_details = validated_data.pop('sport_captain_details')
        
        # Create the house first with pending status
        house = House.objects.create(
            house_name=house_name,
            status='pending'
        )
        
        # Create the proposal
        proposal = HouseProposal.objects.create(
            house=house,
            captain=self.context['request'].user,
            **validated_data
        )
        
        # Add sport captain details
        for captain_data in sport_captain_details:
            SportCaptainDetail.objects.create(
                proposal=proposal,
                sport_id=captain_data['sport_id'],
                name=captain_data['name'],
                roll_no=captain_data['roll_no'],
                email=captain_data['email']
            )
        
        return proposal


# -----------------------------
# LOG MODULE SETTINGS SERIALIZER
# -----------------------------
class LogModuleSettingsSerializer(serializers.ModelSerializer):
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = LogModuleSettings
        fields = [
            'id', 'house_proposals_open', 'player_registration_open', 
            'houses_finalized', 'registration_finalized', 
            'updated_at', 'updated_by', 'updated_by_username'
        ]
        read_only_fields = ['id', 'updated_at', 'updated_by', 'updated_by_username']


# -----------------------------
# LOG MATCH SERIALIZER
# -----------------------------
class LogMatchSerializer(serializers.ModelSerializer):
    sport_name = serializers.CharField(source='sport.sports_name', read_only=True)
    house_a_name = serializers.CharField(source='house_a.house_name', read_only=True)
    house_b_name = serializers.CharField(source='house_b.house_name', read_only=True)
    winner_name = serializers.CharField(source='winner.house_name', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = LogMatch
        fields = [
            'id', 'sport', 'sport_name', 'house_a', 'house_a_name', 
            'house_b', 'house_b_name', 'team_a', 'team_b',
            'scheduled_date', 'venue', 'status',
            'house_a_score', 'house_b_score', 'winner', 'winner_name', 'is_draw',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'winner', 'is_draw', 'created_by', 'created_at', 'updated_at']


# -----------------------------
# LOG LEADERBOARD SERIALIZER
# -----------------------------
class LogLeaderboardSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source='house.house_name', read_only=True)
    sport_name = serializers.CharField(source='sport.sports_name', read_only=True)
    
    class Meta:
        model = LogLeaderboard
        fields = [
            'id', 'house', 'house_name', 'sport', 'sport_name',
            'matches_played', 'wins', 'draws', 'losses', 'points',
            'goals_for', 'goals_against', 'goal_difference', 'updated_at'
        ]
        read_only_fields = [
            'id', 'matches_played', 'wins', 'draws', 'losses', 'points',
            'goals_for', 'goals_against', 'goal_difference', 'updated_at'
        ]

class LogSportWinnerSerializer(serializers.ModelSerializer):
    sport = SportSerializer(read_only=True)
    winner = HouseSerializer(read_only=True)
    
    class Meta:
        model = LogSportWinner
        fields = ['id', 'sport', 'winner', 'is_tie', 'manually_set', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LogConclusionSerializer(serializers.ModelSerializer):
    champion = HouseSerializer(read_only=True)
    runner_up = HouseSerializer(read_only=True)
    concluded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = LogConclusion
        fields = ['id', 'champion', 'runner_up', 'is_concluded', 'concluded_at', 'concluded_by', 'final_standings', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_concluded', 'concluded_at', 'concluded_by', 'final_standings', 'created_at', 'updated_at']


class OlympiadSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OlympiadSettings
        fields = ['id', 'registration_open']
