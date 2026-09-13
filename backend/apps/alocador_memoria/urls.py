from django.urls import path
from .views import AlocadorMemoriaView

urlpatterns = [
    path("simular/", AlocadorMemoriaView.as_view()),
]
