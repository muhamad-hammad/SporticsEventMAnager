from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Sport, House, Team
from .serializers import SportSerializer, HouseSerializer, TeamSerializer

class SportViewSet(viewsets.ModelViewSet):
    queryset = Sport.objects.all()
    serializer_class = SportSerializer

class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
