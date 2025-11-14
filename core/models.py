from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User (with roles)
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('captain', 'House Captain'),
        ('player', 'Player'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='player')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Sport(models.Model):
    EVENT_TYPES = [
        ('LOG', 'Log'),
        ('OLYMPIAD', 'Olympiad'),
    ]
    sport_name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    team_based = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.sport_name} ({self.event_type})"


class House(models.Model):
    house_name = models.CharField(max_length=100)
    captain = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='captain_house')
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return self.house_name


class Team(models.Model):
    EVENT_TYPES = [
        ('LOG', 'Log'),
        ('OLYMPIAD', 'Olympiad'),
    ]
    team_name = models.CharField(max_length=100)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.team_name



class Courts(models.Model):
    court_id = models.AutoField(primary_key=True)
    court_name = models.CharField(max_length=50)   # Futsal, Badminton, Padel
    location = models.CharField(max_length=100, null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(max_length=20, default="available")

    def __str__(self):
        return self.court_name


class CourtSlots(models.Model):
    slot_id = models.AutoField(primary_key=True)
    court = models.ForeignKey(Courts, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.court.court_name} {self.date} {self.start_time}-{self.end_time}"


class CourtBookings(models.Model):
    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    court = models.ForeignKey(Courts, on_delete=models.CASCADE)
    slot = models.ForeignKey(CourtSlots, on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="pending")  # pending, approved, rejected
    payment_id = models.IntegerField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["court", "slot", "status"], name="unique_booking")
        ]

