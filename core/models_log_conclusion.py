# Additional models for LOG conclusion feature
# These will be appended to core/models.py

from django.db import models
from django.contrib.auth.models import User


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
