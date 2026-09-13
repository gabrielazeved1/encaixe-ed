from django.urls import path
from .views import BuscaHashView

urlpatterns = [
    path("comparar/", BuscaHashView.as_view()),
]
