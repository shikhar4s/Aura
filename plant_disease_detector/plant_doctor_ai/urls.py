from django.urls import path
from .views import (
    AnalyzePlantView,
    AnalysisHistoryView,
    AnalyticsDashboardView,
)

urlpatterns = [
    # Main endpoint for analyzing an image
    path('analyze/', AnalyzePlantView.as_view(), name='analyze-plant'),

    # Endpoint to get user's analysis history
    path('history/', AnalysisHistoryView.as_view(), name='analysis-history'),

    # Endpoint for the analytics dashboard data
    path('analytics/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]