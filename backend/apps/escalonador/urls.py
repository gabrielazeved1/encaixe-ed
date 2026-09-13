from django.urls import path
from .views import EscalonadorView

urlpatterns = [
    path("simular/", EscalonadorView.as_view()),
]
