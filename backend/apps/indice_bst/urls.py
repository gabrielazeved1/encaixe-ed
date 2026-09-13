from django.urls import path
from .views import IndiceBSTView

urlpatterns = [
    path("simular/", IndiceBSTView.as_view()),
]
