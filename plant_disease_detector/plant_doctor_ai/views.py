from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Avg, Count
from django.db import transaction

# Import your services and models
# from .services.model_service import plant_disease_model_service
from .services.gemini_service import gemini_service
from .models import AnalysisResult
from users.models import User
from .serializers import AnalysisResultSerializer

def infer_severity(confidence):
    """
    A simple function to infer disease severity from prediction confidence.
    This is a placeholder logic. You might want to develop a more
    sophisticated method based on disease type.
    """
    if confidence > 0.9:
        return AnalysisResult.Severity.HIGH
    elif confidence > 0.75:
        return AnalysisResult.Severity.MEDIUM
    else:
        return AnalysisResult.Severity.LOW

class AnalyzePlantView(APIView):
    """
    Handles the image upload, analysis, and returns the full result.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        image_file = request.data.get('image')
        language = request.headers.get('Language')
        
        if not image_file:
            return Response(
                {"error": "Image file not provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # 1. Predict disease using the PyTorch model
        # prediction = plant_disease_model_service.predict(image_file)
        # if not prediction:
        #     return Response(
        #         {"error": "Failed to analyze the image."},
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
        #     )

        prediction = {
            "disease": "Tomato___Late_blight",
            "confidence": 0.89
        }

        # 2. Get treatment info from Gemini
        treatment_info = gemini_service.get_treatment_info(prediction['disease'], language=language)

        # 3. Infer severity based on confidence
        severity = infer_severity(prediction['confidence'])

        # 4. Save the result to the database
        analysis = AnalysisResult.objects.create(
            user=user,
            image=image_file,
            disease_name=prediction['disease'],
            confidence=prediction['confidence'],
            severity=severity,
            recommended_treatment=treatment_info.get('recommended_treatment', 'N/A'),
            prevention_tips=treatment_info.get('prevention_tips', []),
            expected_recovery_time=treatment_info.get('expected_recovery_time', 'Varies')
        )

        # 5. Update user analytics
        user.total_uploads += 1
        user.total_analyzed += 1
        user.save(update_fields=['total_uploads', 'total_analyzed'])

        # 6. Format the response to match the frontend ResultCard/Modal
        response_data = {
            "id": analysis.id,
            "disease": analysis.disease_name.replace('___', ' ').replace('_', ' '),
            "confidence": analysis.confidence,
            "severity": analysis.severity,
            "cure": analysis.recommended_treatment,
            "recoveryTime": analysis.expected_recovery_time,
            "preventiveMeasures": analysis.prevention_tips,
            "preview": request.build_absolute_uri(analysis.image.url)
        }

        return Response(response_data, status=status.HTTP_200_OK)


class AnalysisHistoryView(ListAPIView):
    """
    Returns a paginated list of the user's past analysis results.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AnalysisResultSerializer

    def get_queryset(self):
        # Return results only for the currently logged-in user
        return AnalysisResult.objects.filter(user=self.request.user)


class AnalyticsDashboardView(APIView):
    """
    Provides aggregated data for the user's analytics dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        queryset = AnalysisResult.objects.filter(user=user)

        # Basic Stats
        total_uploads = user.total_uploads
        total_analyzed = queryset.count()

        # Aggregated Stats
        avg_confidence_data = queryset.aggregate(avg_conf=Avg('confidence'))
        avg_confidence = avg_confidence_data['avg_conf'] or 0

        # Distribution Stats
        disease_distribution = list(
            queryset.values('disease_name')
            .annotate(count=Count('disease_name'))
            .order_by('-count')
        )
        
        severity_distribution = list(
            queryset.values('severity')
            .annotate(count=Count('severity'))
            .order_by('-count')
        )

        # Format for UI
        formatted_disease_dist = [
            {"name": item['disease_name'].replace('___', ' ').replace('_', ' '), "value": item['count']}
            for item in disease_distribution
        ]
        
        formatted_severity_dist = [
            {"name": item['severity'], "value": item['count']}
            for item in severity_distribution
        ]

        dashboard_data = {
            "summary": {
                "totalUploads": total_uploads,
                "analyzed": total_analyzed,
                "successRate": 100 if total_uploads > 0 else 0, # Placeholder
                "avgConfidence": round(avg_confidence * 100)
            },
            "diseaseDistribution": formatted_disease_dist,
            "severityDistribution": formatted_severity_dist
        }

        return Response(dashboard_data, status=status.HTTP_200_OK)