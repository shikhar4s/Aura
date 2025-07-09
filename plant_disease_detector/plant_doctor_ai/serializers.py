from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import AnalysisResult
from users.models import User

class AnalysisResultSerializer(serializers.ModelSerializer):
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
    
class ChatPartSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=False)

class ChatHistoryItemSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'model'])
    parts = serializers.ListField(
        child=ChatPartSerializer(),
        min_length=1,
        max_length=1
    )

class ChatbotRequestSerializer(serializers.Serializer):
    history = ChatHistoryItemSerializer(
        many=True,
        required=False,
        allow_empty=True,
        default=list
    )
    newMessage = serializers.CharField(
        max_length=4096,
        allow_blank=False,
        trim_whitespace=True
    )