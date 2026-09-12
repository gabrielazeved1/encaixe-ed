from django.urls import path, include

urlpatterns = [
    path("api/pilha/", include("apps.pilha.urls")),
]
