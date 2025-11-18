# Register your models here.
from django.contrib import admin
from .models import Courts, User, House, Sport, Team, Booking


admin.site.register(User)
admin.site.register(House)
admin.site.register(Sport)
admin.site.register(Team)

#admin.site.register(Courts)


@admin.register(Courts)
class CourtsAdmin(admin.ModelAdmin):
    list_display = ("court_name", "location", "hourly_rate", "status")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "court", "date", "start_time", "end_time", "total_cost", "status", "created_at")
    list_filter = ("court", "date", "status")
    search_fields = ("user__username", "court__court_name")
