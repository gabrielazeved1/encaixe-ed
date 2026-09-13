from django.urls import path
from .views import GrausSeparacaoView

urlpatterns = [
    path("bfs/", GrausSeparacaoView.as_view()),
]
