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
