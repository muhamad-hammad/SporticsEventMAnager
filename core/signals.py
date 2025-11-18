from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Player

@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created and instance.role == "player":
        Player.objects.create(user=instance)
