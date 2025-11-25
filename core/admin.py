# Register your models here.
from django.contrib import admin
from .models import Courts, User, House, Sport, Team,Booking,SportRegistration, OlympiadSettings

admin.site.register(User)
admin.site.register(House)
admin.site.register(Sport)
admin.site.register(Team)
admin.site.register(SportRegistration)
admin.site.register(OlympiadSettings)

@admin.register(Courts)
class CourtsAdmin(admin.ModelAdmin):
    list_display = ("court_name", "location", "hourly_rate", "status")

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'court', 'date', 'start_time', 'end_time', 'status', 'created_at']
    list_filter = ['status', 'date', 'court']
    search_fields = ['user__username', 'court__court_name']
    actions = ['approve_bookings', 'reject_bookings']
    
    def approve_bookings(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} booking(s) approved.")
    approve_bookings.short_description = "Approve selected bookings"
    
    def reject_bookings(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} booking(s) rejected.")
    reject_bookings.short_description = "Reject selected bookings"