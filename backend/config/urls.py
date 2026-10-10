from django.urls import path, include

urlpatterns = [
    path("api/pilha/", include("apps.pilha.urls")),
    path("api/escalonador/", include("apps.escalonador.urls")),
    path("api/roteamento/", include("apps.roteamento.urls")),
    path("api/graus/", include("apps.graus_separacao.urls")),
    path("api/hash/", include("apps.busca_hash.urls")),
    path("api/bst/", include("apps.indice_bst.urls")),
    path("api/memoria/", include("apps.alocador_memoria.urls")),
    path("api/jogo_adivinhe/", include("apps.jogo_adivinhe.urls")),
]
