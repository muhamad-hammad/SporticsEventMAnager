from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from decimal import Decimal
# --------------------------------------------------
# CUSTOM USER MODEL
# --------------------------------------------------
class User(AbstractUser):
    ROLE_CHOICES = [
        ("general", "General User"),   # Can book courts, create teams
        ("player", "Player"),          # Registered for a sport
        ("captain", "House Captain"),  # Assigned to lead a house
        ("admin", "Admin"),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="general")
    contact_no = models.CharField(max_length=20, null=True, blank=True)
    department = models.CharField(max_length=50, null=True, blank=True)
    registration_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.username} ({self.role})"


# --------------------------------------------------
# HOUSE MODEL
# --------------------------------------------------
class House(models.Model):
    house_name = models.CharField(max_length=100)
    captain = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="captain_of"
    )
    status = models.CharField(
        max_length=20,
        choices=[("pending", "pending"), ("active", "active"), ("inactive", "inactive")],
        default="pending"
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.house_name


# --------------------------------------------------
# SPORT MODEL
# --------------------------------------------------

class Sport(models.Model):
    sports_name = models.CharField(max_length=100, unique=True ,default="Unknown Sport")
    min_players = models.IntegerField(default=1)  # Add default if you have existing data
    max_players = models.IntegerField(default=11) # Add default if you have existing data
    status = models.CharField(
        max_length=20,
        choices=[("General", "General"), ("Esports", "Esports"),("Sports", "Sports")],
        default="Sports"
    )

    def __str__(self):
        return self.sports_name




# --------------------------------------------------
# PLAYER PROFILE (Optional Registration)
# --------------------------------------------------
class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Player: {self.user.username}"

# --------------------------------------------------
# PLAYER SPORT REGISTRATION
# --------------------------------------------------


class PlayerSportRegistration(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    approved_by_admin = models.BooleanField(default=False)
    remarks = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ("player", "sport")

    def __str__(self):
        return f"{self.player.user.username} → {self.sport.sports_name}"


# --------------------------------------------------
# TEAM MODEL
# --------------------------------------------------
class Team(models.Model):
    EVENT_CHOICES = [
        ("LOG", "LOG")
    ]

    team_name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    
    # House is optional; required for LOG, forbidden for OLYMPIAD
    house = models.ForeignKey(House, null=True, blank=True, on_delete=models.SET_NULL)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="teams_created")
    captain = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="teams_captained")
    
    created_at = models.DateTimeField(default=timezone.now)

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.event_type == "LOG" and self.house is None:
            raise ValidationError("LOG teams must belong to a house.")
        if self.event_type == "OLYMPIAD" and self.house is not None:
            raise ValidationError("OLYMPIAD teams cannot have a house.")

    def __str__(self):
        return self.team_name


# --------------------------------------------------
# TEAM PLAYERS (Draft System)
# --------------------------------------------------
class TeamPlayer(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    is_captain = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[("drafted", "drafted"), ("active", "active"), ("released", "released")],
        default="drafted"
    )
    draft_round = models.IntegerField(null=True, blank=True)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("team", "player")

    def __str__(self):
        return f"{self.player.user.username} in {self.team.team_name}"


# --------------------------------------------------
# COURT BOOKING SYSTEM
# --------------------------------------------------


class Courts(models.Model):
    court_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    status = models.BooleanField(default=True)  # active / inactive

    def __str__(self):
        return self.court_name


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    court = models.ForeignKey(Courts, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name="end_after_start"),
        ]

    def __str__(self):
        return f"{self.user.username} | {self.court.court_name} | {self.date} {self.start_time}-{self.end_time} [{self.status}]"


# --------------------------------------------------
# OLYMPIAD MODELS
# --------------------------------------------------

#--------------------------------------------------
# SPORT REGISTRATION DETAILS For Olympiad Events
#--------------------------------------------------

class SportRegistration(models.Model):
    sport = models.OneToOneField(Sport, on_delete=models.CASCADE, related_name='registration')
    entry_fee = models.DecimalField(max_digits=8, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.sport.sports_name} - Fee: {self.entry_fee}"


class TeamRegistration(models.Model):
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    #sport_registration = models.ForeignKey(SportRegistration, on_delete=models.SET_NULL, null=True)

    team_name = models.CharField(max_length=150)
    captain = models.ForeignKey(User, on_delete=models.CASCADE)
    #total_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} ({self.sport.sports_name})"


class OlympiadPlayer(models.Model):
    team = models.ForeignKey(TeamRegistration, on_delete=models.CASCADE, related_name="players")
    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} - {self.team.team_name}"
    












#   Matches
class Match(models.Model):
    ROUND_CHOICES = (
        ("knockout", "Knockout"),
        ("round_robin", "Round Robin"),
        ("quarter_final", "Quarter Final"),
        ("semi_final", "Semi Final"),
        ("final", "Final"),
    )
    EVENT_TYPE_CHOICES = (
        ("LOG", "LOG"),
        ("OLYMPIAD", "OLYMPIAD"),
    )
    
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default="OLYMPIAD")
    
    # For LOG teams
    team1 = models.ForeignKey(Team, related_name='team1_matches', on_delete=models.CASCADE, null=True, blank=True)
    team2 = models.ForeignKey(Team, related_name='team2_matches', on_delete=models.CASCADE, null=True, blank=True)
    winner = models.ForeignKey(Team, related_name='won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    
    # For Olympiad teams
    olympiad_team1 = models.ForeignKey(TeamRegistration, related_name='olympiad_team1_matches', on_delete=models.CASCADE, null=True, blank=True)
    olympiad_team2 = models.ForeignKey(TeamRegistration, related_name='olympiad_team2_matches', on_delete=models.CASCADE, null=True, blank=True)
    olympiad_match_winner = models.ForeignKey(TeamRegistration, related_name='olympiad_won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    
    date = models.DateTimeField()
    time = models.TimeField(null=True, blank=True)  # Optional time field
    location = models.CharField(max_length=200, blank=True, null=True)
    round = models.CharField(max_length=50, choices=ROUND_CHOICES)
    status = models.CharField(max_length=20, default="scheduled")  # scheduled / completed
    score_team1 = models.IntegerField(null=True, blank=True)
    score_team2 = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.event_type == "LOG":
            if not self.team1 or not self.team2:
                raise ValidationError("LOG matches must have team1 and team2 (Team model).")
            if self.olympiad_team1 or self.olympiad_team2:
                raise ValidationError("LOG matches cannot have olympiad teams.")
        
        if self.event_type == "OLYMPIAD":
            if not self.olympiad_team1 or not self.olympiad_team2:
                raise ValidationError("OLYMPIAD matches must have olympiad_team1 and olympiad_team2.")
            if self.team1 or self.team2:
                raise ValidationError("OLYMPIAD matches cannot have LOG teams.")

    def __str__(self):
        if self.event_type == "LOG":
            return f"{self.team1.team_name} vs {self.team2.team_name} ({self.round})"
        else:
            return f"{self.olympiad_team1.team_name} vs {self.olympiad_team2.team_name} ({self.round})"