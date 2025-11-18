from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings

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
    sport_name = models.CharField(max_length=100)
    event_type = models.CharField(
        max_length=20,
        choices=[("LOG", "LOG"), ("OLYMPIAD", "OLYMPIAD")]
    )
    team_based = models.BooleanField(default=True)

    def __str__(self):
        return self.sport_name


# --------------------------------------------------
# PLAYER PROFILE (Optional Registration)
# --------------------------------------------------
class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(null=True, blank=True)
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
        return f"{self.player.user.username} → {self.sport.sport_name}"


# --------------------------------------------------
# TEAM MODEL
# --------------------------------------------------
class Team(models.Model):
    EVENT_CHOICES = [
        ("LOG", "LOG"),
        ("OLYMPIAD", "OLYMPIAD"),
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
    location = models.CharField(max_length=100)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.court_name


class Booking(models.Model):
    court = models.ForeignKey(Courts, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} | {self.court.court_name} | {self.date} {self.start_time}-{self.end_time}"
