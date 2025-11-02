from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SportViewSet, HouseViewSet, TeamViewSet

router = DefaultRouter()
router.register('sports', SportViewSet)
router.register('houses', HouseViewSet)
router.register('teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
