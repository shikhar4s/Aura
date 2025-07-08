from django.db import models
from django.conf import settings

class AnalysisResult(models.Model):
    class Severity(models.TextChoices):
        LOW = 'Low', 'Low'
        MEDIUM = 'Medium', 'Medium'
        HIGH = 'High', 'High'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='analyses')
    image = models.ImageField(upload_to='analyses/%Y/%m/%d/')
    disease_name = models.CharField(max_length=255)
    confidence = models.FloatField()
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.LOW)
    recommended_treatment = models.TextField()
    prevention_tips = models.JSONField(default=list) # Use JSONField for the list of tips
    expected_recovery_time = models.CharField(max_length=100, default="N/A")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.disease_name} for {self.user.email} at {self.created_at.strftime('%Y-%m-%d')}"