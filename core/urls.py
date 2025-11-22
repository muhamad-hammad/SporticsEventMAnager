from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import( RegisterPlayer, SportDetailListAPIView, SportViewSet,SportRegistrationViewSet, HouseViewSet, TeamViewSet,RegisterSportView,CreateBooking
,AvailableSlots, CreateBooking, MyBookings, GetBooking, CalculateCost,PendingBookings,  AllBookings, UpdateBookingStatus, BulkBookCourt
, TeamRegistrationCreateAPIView, TeamRegistrationListAPIView, ApproveTeamRegistrationAPIView)

from . import views

router = DefaultRouter()
router.register('sports', SportViewSet)
router.register('houses', HouseViewSet)
router.register('teams', TeamViewSet)
router.register('sport-registration', SportRegistrationViewSet)


urlpatterns = [
    path('', include(router.urls)),              # your existing ViewSets
    path("courts/", views.get_courts),           # new court APIs
    path('player/register/', RegisterPlayer.as_view()), # new player registration API
    path("register-sport/", RegisterSportView.as_view(), name="register-sport"), # new sport registration API
    path("courts/<int:court_id>/available-slots/", AvailableSlots.as_view(), name="available-slots"), # available slots API
    path("book-slot/", CreateBooking.as_view(), name="book-slot"), # booking API
    path("book-slots-bulk/", BulkBookCourt.as_view(), name="book-slots-bulk"), # bulk booking API
    path("my-bookings/", MyBookings.as_view(), name="my-bookings"), # my bookings API
    path("booking/<int:booking_id>/", GetBooking.as_view(), name="get-booking"), # get booking details API
    path("calculate-cost/", CalculateCost.as_view(), name="calculate-cost"), # calculate cost API
    path('admin/bookings/pending/', PendingBookings.as_view()), # pending bookings for admin
    path('admin/bookings/update-status/<int:booking_id>/', UpdateBookingStatus.as_view(), name='update-booking-status'),    # update booking status API
    path('admin/bookings/all/', AllBookings.as_view()), # all bookings for admin
    
    path('olympiad/team/register/', TeamRegistrationCreateAPIView.as_view(), name='olympiad-team-register'),
    path('olympiad/teams/', TeamRegistrationListAPIView.as_view(), name='olympiad-team-list'),
    path('olympiad/team/<int:team_id>/approve/', ApproveTeamRegistrationAPIView.as_view(), name='olympiad-team-approve'),
    path('olympiad/sports/', SportDetailListAPIView.as_view(), name='sports-detail-list'),

]




