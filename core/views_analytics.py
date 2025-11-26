from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from .models import User, Booking
from datetime import date

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)

        total_users = User.objects.count()
        total_revenue = Booking.objects.filter(status='approved').aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        total_bookings = Booking.objects.count()

        return Response({
            "total_users": total_users,
            "total_revenue": total_revenue,
            "total_bookings": total_bookings
        })

class BookingAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)

        # KPI Data
        total_revenue = Booking.objects.filter(status='approved').aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        pending_requests = Booking.objects.filter(status='pending').count()
        todays_bookings = Booking.objects.filter(date=date.today(), status='approved').count()

        # Charts Data

        # 1. Revenue Trend
        revenue_trend = Booking.objects.filter(status='approved').annotate(
            day=TruncDate('date')
        ).values('day').annotate(
            daily_revenue=Sum('total_cost')
        ).order_by('day')

        # 2. Top Users
        top_users = Booking.objects.filter(status='approved').values(
            'user__username'
        ).annotate(
            bookings_count=Count('id')
        ).order_by('-bookings_count')[:5]

        # 3. Popular Courts
        popular_courts = Booking.objects.filter(status='approved').values(
            'court__court_name'
        ).annotate(
            bookings_count=Count('id')
        ).order_by('-bookings_count')[:5]

        return Response({
            "kpi": {
                "total_revenue": total_revenue,
                "pending_requests": pending_requests,
                "todays_bookings": todays_bookings
            },
            "charts": {
                "revenue_trend": list(revenue_trend),
                "top_users": list(top_users),
                "popular_courts": list(popular_courts)
            }
        })
