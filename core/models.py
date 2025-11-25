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
# HOUSE CAPTAIN MODEL
# --------------------------------------------------

class HouseCaptain(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    house = models.ForeignKey(House, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.house.name}"


# --------------------------------------------------
# SPORT MODEL
# --------------------------------------------------

class Sport(models.Model):
    sports_name = models.CharField(max_length=100, unique=True ,default="Unknown Sport")
    min_players = models.IntegerField(default=1)  # Add default if you have existing data
    max_players = models.IntegerField(default=11) # Add default if you have existing data
    is_availableinLog = models.BooleanField(default=False)
    is_availableinOlympiad = models.BooleanField(default=True)
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
    #house = models.ForeignKey(House, null=True, blank=True, on_delete=models.SET_NULL)
    approved_by_admin = models.BooleanField(default=False)
    remarks = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ("player", "sport")

    def __str__(self):
        return f"{self.player.user.username} → {self.sport.sports_name}"

class PlayerRegistration(models.Model):
    STATUS = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS, default="pending")

    def __str__(self):
        return f"{self.user.username} - {self.sport.name}"

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
    rejected = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} ({self.sport.sports_name})"


class OlympiadPlayer(models.Model):
    team = models.ForeignKey(TeamRegistration, on_delete=models.CASCADE, related_name="players")
    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} - {self.team.team_name}"


class OlympiadSettings(models.Model):
    """Singleton model to manage Olympiad module settings"""
    registration_open = models.BooleanField(default=False, help_text="Allow teams to register for Olympiad")
    
    class Meta:
        verbose_name = "Olympiad Settings"
        verbose_name_plural = "Olympiad Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and OlympiadSettings.objects.exists():
            raise ValueError("Only one OlympiadSettings instance is allowed")
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
    
    def __str__(self):
        return f"Olympiad Settings (Registration: {'Open' if self.registration_open else 'Closed'})"
    












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
        





# --------------------------------------------------
# House Proposal Model
## --------------------------------------------------
class HouseProposal(models.Model):
    house = models.OneToOneField(House, on_delete=models.CASCADE)
    captain = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[("pending","Pending"),("approved","Approved"),("rejected","Rejected")], default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.house.house_name} - {self.captain.username}"


class SportCaptainDetail(models.Model):
    """Store sport captain details for each sport in a house proposal"""
    proposal = models.ForeignKey(HouseProposal, on_delete=models.CASCADE, related_name="sport_captains")
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    roll_no = models.CharField(max_length=50)
    email = models.EmailField()
    
    class Meta:
        unique_together = ('proposal', 'sport')
    
    def __str__(self):
        return f"{self.name} - {self.sport.sports_name} ({self.proposal.house.house_name})"



class DraftPick(models.Model):
    STATUS = (
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    player = models.ForeignKey(PlayerRegistration, on_delete=models.CASCADE)
    picked_by = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS, default="pending")
    round_number = models.IntegerField(default=1)
    pick_order = models.IntegerField(default=0)
    picked_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('team', 'player')

    def __str__(self):
        return f"{self.team} -> {self.player.user.username}"


class DraftSession(models.Model):
    """Manages the draft process for a specific sport"""
    STATUS_CHOICES = (
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    )
    
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
    current_round = models.IntegerField(default=1)
    current_pick_index = models.IntegerField(default=0)  # Index in the house rotation
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('sport',)
    
    def __str__(self):
        return f"Draft Session - {self.sport.sports_name} ({self.status})"


class LogModuleSettings(models.Model):
    """
    Singleton model to control LOG module access and states
    Only one instance should exist
    """
    house_proposals_open = models.BooleanField(default=False, help_text="Allow users to propose new houses")
    player_registration_open = models.BooleanField(default=False, help_text="Allow players to register for sports")
    houses_finalized = models.BooleanField(default=False, help_text="Houses have been finalized, no more proposals")
    registration_finalized = models.BooleanField(default=False, help_text="Player registrations finalized, no more registrations")
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = "LOG Module Settings"
        verbose_name_plural = "LOG Module Settings"
    
    def __str__(self):
        return f"LOG Settings (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance"""
        settings, created = cls.objects.get_or_create(id=1)
        return settings


class Notification(models.Model):
    to_admin = models.BooleanField(default=False)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class LogMatch(models.Model):
    """
    Represents a match between two houses for a specific sport in LOG
    """
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='log_matches')
    house_a = models.ForeignKey(House, on_delete=models.CASCADE, related_name='log_matches_as_a')
    house_b = models.ForeignKey(House, on_delete=models.CASCADE, related_name='log_matches_as_b')
    
    # Team references (optional - for getting player rosters)
    team_a = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='log_matches_as_team_a')
    team_b = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='log_matches_as_team_b')
    
    scheduled_date = models.DateTimeField()
    venue = models.CharField(max_length=200, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Results - flexible for different sports (goals/runs/sets/points as text)
    house_a_score = models.CharField(max_length=50, null=True, blank=True)  # e.g., "245 runs", "3 goals", "2 sets"
    house_b_score = models.CharField(max_length=50, null=True, blank=True)
    winner = models.ForeignKey(House, on_delete=models.SET_NULL, null=True, blank=True, related_name='log_matches_won')
    is_draw = models.BooleanField(default=False)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='log_matches_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_date']
        verbose_name = 'LOG Match'
        verbose_name_plural = 'LOG Matches'
    
    def __str__(self):
        return f"{self.house_a.house_name} vs {self.house_b.house_name} - {self.sport.sports_name}"
    
    def save(self, *args, **kwargs):
        # No auto-winner determination - admin selects winner manually
        super().save(*args, **kwargs)
        
        # Update leaderboard if match is completed
        if self.status == 'completed':
            self.update_leaderboard()
    
    def update_leaderboard(self):
        """Update leaderboard entries for both houses"""
        # Update house A
        leaderboard_a, _ = LogLeaderboard.objects.get_or_create(
            house=self.house_a,
            sport=self.sport
        )
        leaderboard_a.recalculate_stats()
        
        # Update house B
        leaderboard_b, _ = LogLeaderboard.objects.get_or_create(
            house=self.house_b,
            sport=self.sport
        )
        leaderboard_b.recalculate_stats()


class LogLeaderboard(models.Model):
    """
    Tracks points and statistics for each house in each sport
    """
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='log_leaderboard_entries')
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE, related_name='log_leaderboard_entries')
    
    # Statistics
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    points = models.IntegerField(default=0)  # 3 for win, 1 for draw, 0 for loss
    
    # Additional stats
    goals_for = models.IntegerField(default=0)  # Total scores by this house
    goals_against = models.IntegerField(default=0)  # Total scores against this house
    goal_difference = models.IntegerField(default=0)  # goals_for - goals_against
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('house', 'sport')
        ordering = ['-points', '-goal_difference', '-goals_for']
        verbose_name = 'LOG Leaderboard Entry'
        verbose_name_plural = 'LOG Leaderboard'
    
    def __str__(self):
        return f"{self.house.house_name} - {self.sport.sports_name} ({self.points} pts)"
    
    def recalculate_stats(self):
        """Recalculate all statistics from completed matches"""
        # Get all completed matches for this house and sport
        matches_as_a = LogMatch.objects.filter(
            sport=self.sport,
            house_a=self.house,
            status='completed'
        )
        matches_as_b = LogMatch.objects.filter(
            sport=self.sport,
            house_b=self.house,
            status='completed'
        )
        
        # Reset stats
        self.matches_played = 0
        self.wins = 0
        self.draws = 0
        self.losses = 0
        self.points = 0
        self.goals_for = 0
        self.goals_against = 0
        
        # Calculate from matches as house_a
        for match in matches_as_a:
            self.matches_played += 1
            # Note: goals_for/against not calculated since scores are text (different formats per sport)
            
            if match.is_draw:
                self.draws += 1
                self.points += 1
            elif match.winner == self.house:
                self.wins += 1
                self.points += 3
            else:
                self.losses += 1
        
        # Calculate from matches as house_b
        for match in matches_as_b:
            self.matches_played += 1
            # Note: goals_for/against not calculated since scores are text (different formats per sport)
            
            if match.is_draw:
                self.draws += 1
                self.points += 1
            elif match.winner == self.house:
                self.wins += 1
                self.points += 3
            else:
                self.losses += 1
        
        # Goal difference not calculated (scores are text, not comparable across sports)
        self.goal_difference = 0
        
        self.save()


class LogSportWinner(models.Model):
    """
    Tracks the winner for each sport in LOG module.
    Can be automatically determined or manually set if there's a tie.
    """
    sport = models.OneToOneField('Sport', on_delete=models.CASCADE, related_name='log_sport_winner')
    winner = models.ForeignKey('House', on_delete=models.CASCADE, related_name='log_sports_won', null=True, blank=True)
    is_tie = models.BooleanField(default=False)
    manually_set = models.BooleanField(default=False)  # True if admin manually selected winner
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'LOG Sport Winner'
        verbose_name_plural = 'LOG Sport Winners'
    
    def __str__(self):
        if self.is_tie and not self.winner:
            return f"{self.sport.sports_name} - Tie (No winner set)"
        return f"{self.sport.sports_name} - {self.winner.house_name if self.winner else 'No winner'}"
    
    def auto_determine_winner(self):
        """Automatically determine sport winner based on points"""
        from .models import LogLeaderboard
        
        leaderboard = LogLeaderboard.objects.filter(sport=self.sport).order_by('-points', '-wins', '-matches_played')
        
        if leaderboard.count() < 1:
            return
        
        top_house = leaderboard.first()
        
        # Check if there's a tie
        if leaderboard.count() > 1:
            second_house = leaderboard[1]
            if top_house.points == second_house.points and top_house.wins == second_house.wins:
                self.is_tie = True
                self.winner = None  # Requires manual selection
                self.manually_set = False
                self.save()
                return
        
        # Clear winner
        self.winner = top_house.house
        self.is_tie = False
        self.manually_set = False
        self.save()


class LogConclusion(models.Model):
    """
    Stores the final conclusion of LOG module with overall champion and runner-up.
    Only one conclusion record should exist per LOG cycle.
    """
    champion = models.ForeignKey('House', on_delete=models.CASCADE, related_name='log_championships', null=True, blank=True)
    runner_up = models.ForeignKey('House', on_delete=models.CASCADE, related_name='log_runnerups', null=True, blank=True)
    
    is_concluded = models.BooleanField(default=False)
    concluded_at = models.DateTimeField(null=True, blank=True)
    concluded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='log_conclusions')
    
    # Optional: Store snapshot of final standings
    final_standings = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'LOG Conclusion'
        verbose_name_plural = 'LOG Conclusions'
        ordering = ['-created_at']
    
    def __str__(self):
        if self.is_concluded:
            return f"LOG Concluded - Champion: {self.champion.house_name if self.champion else 'TBD'}"
        return "LOG - Not Concluded"
    
    def conclude(self, user):
        """Conclude LOG and determine champion/runner-up from overall leaderboard"""
        from django.db.models import Sum
        from django.utils import timezone
        from .models import LogLeaderboard, House, Sport
        
        # Get overall standings
        houses = House.objects.all()
        standings = []
        
        for house in houses:
            stats = LogLeaderboard.objects.filter(house=house).aggregate(
                total_points=Sum('points'),
                total_wins=Sum('wins'),
                total_matches=Sum('matches_played')
            )
            standings.append({
                'house_id': house.id,
                'house_name': house.house_name,
                'total_points': stats['total_points'] or 0,
                'total_wins': stats['total_wins'] or 0,
                'total_matches': stats['total_matches'] or 0
            })
        
        # Sort by points, then wins
        standings.sort(key=lambda x: (x['total_points'], x['total_wins']), reverse=True)
        
        # Store House objects separately
        if len(standings) >= 1:
            self.champion = House.objects.get(id=standings[0]['house_id'])
        if len(standings) >= 2:
            self.runner_up = House.objects.get(id=standings[1]['house_id'])
        
        self.is_concluded = True
        self.concluded_at = timezone.now()
        self.concluded_by = user
        self.final_standings = standings
        self.save()
        
        # Auto-determine sport winners
        sports = Sport.objects.filter(is_availableinLog=True)
        for sport in sports:
            sport_winner, created = LogSportWinner.objects.get_or_create(sport=sport)
            sport_winner.auto_determine_winner()
