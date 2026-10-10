from django.urls import path

from .views import PalpiteView, RodadaView


urlpatterns = [
    path("rodada", RodadaView.as_view()),
    path("palpite", PalpiteView.as_view()),
]
