from django.urls import path
from .views import RealEstateAnalyzeView

urlpatterns = [
    path('analyze/', RealEstateAnalyzeView.as_view(), name='analyze-locality'),
]