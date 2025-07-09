from django.urls import path
from .views import (
    AnalyzePlantView,
    AnalysisHistoryView,
    AnalyticsDashboardView,
    ChatbotView
)

urlpatterns = [
    path('analyze/', AnalyzePlantView.as_view(), name='analyze-plant'),
    path('history/', AnalysisHistoryView.as_view(), name='analysis-history'),
    path('analytics/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('chat/', ChatbotView.as_view(), name='chat')
]