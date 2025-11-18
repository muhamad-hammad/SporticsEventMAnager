from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterPlayer, SportViewSet, HouseViewSet, TeamViewSet,RegisterSportView,CreateBooking
from . import views

router = DefaultRouter()
router.register('sports', SportViewSet)
router.register('houses', HouseViewSet)
router.register('teams', TeamViewSet)

urlpatterns = [
    path('', include(router.urls)),              # your existing ViewSets
    path("courts/", views.get_courts),           # new court APIs
    path('player/register/', RegisterPlayer.as_view()), # new player registration API
    path("register-sport/", RegisterSportView.as_view(), name="register-sport"), # new sport registration API
    path("book-slot/", CreateBooking.as_view(), name="book-slot"),  # new slot booking API
]


