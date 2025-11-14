from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SportViewSet, HouseViewSet, TeamViewSet
from . import views

router = DefaultRouter()
router.register('sports', SportViewSet)
router.register('houses', HouseViewSet)
router.register('teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),              # your existing ViewSets
    path("courts/", views.get_courts),           # new court APIs
    path("slots/", views.get_available_slots),   # new slot APIs
    path("book/", views.book_slot),              # new booking API
]
