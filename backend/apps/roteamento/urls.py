from django.urls import path
from .views import RoteamentoView

urlpatterns = [
    path("calcular/", RoteamentoView.as_view()),
]
