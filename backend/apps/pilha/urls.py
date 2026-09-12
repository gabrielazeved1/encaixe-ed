from django.urls import path
from .views import PilhaView

urlpatterns = [
    path("simular/", PilhaView.as_view()),
]
