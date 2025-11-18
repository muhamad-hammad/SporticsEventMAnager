# Register your models here.
from django.contrib import admin
from .models import Courts, User, House, Sport, Team

admin.site.register(User)
admin.site.register(House)
admin.site.register(Sport)
admin.site.register(Team)

admin.site.register(Courts)