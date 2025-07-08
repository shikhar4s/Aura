from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import AnalysisResult
from users.models import User

class AnalysisResultSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField to match the exact keys expected by the frontend
    # This is for the 'Upload History' page image
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AnalysisResult
        fields = [
            'id', 'image_url', 'disease_name', 'confidence',
            'severity', 'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None