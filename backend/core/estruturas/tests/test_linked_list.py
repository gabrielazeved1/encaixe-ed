from core.estruturas.linked_list import LinkedList, MEMORIA_TOTAL


def test_alocar_reduz_espaco_livre() -> None:
    ll = LinkedList()
    ll.alocar(64)
    estado = ll.estado()
    assert estado["livre_total"] == MEMORIA_TOTAL - 64
    assert estado["usado_total"] == 64


def test_liberar_aumenta_espaco_livre() -> None:
    ll = LinkedList()
    bloco = ll.alocar(64)
    assert bloco is not None
    ll.liberar(int(bloco["id"]))
    assert ll.estado()["livre_total"] == MEMORIA_TOTAL


def test_alocar_sem_espaco_retorna_none() -> None:
    ll = LinkedList()
    ll.alocar(MEMORIA_TOTAL)
    assert ll.alocar(1) is None


def test_coalescer_une_blocos_adjacentes() -> None:
    ll = LinkedList()
    b1 = ll.alocar(64)
    b2 = ll.alocar(64)
    assert b1 is not None and b2 is not None
    ll.liberar(int(b1["id"]))
    ll.liberar(int(b2["id"]))
    estado = ll.estado()
    blocos = estado["blocos"]
    assert isinstance(blocos, list)
    livres = [b for b in blocos if b["livre"]]
    assert len(livres) == 1
    assert livres[0]["tamanho"] == MEMORIA_TOTAL


def test_fragmentacao_aumenta_com_liberacoes() -> None:
    ll = LinkedList()
    b1 = ll.alocar(64)
    b2 = ll.alocar(64)
    b3 = ll.alocar(64)
    assert b1 is not None and b2 is not None and b3 is not None
    ll.liberar(int(b1["id"]))
    ll.liberar(int(b3["id"]))
    estado = ll.estado()
    assert float(estado["fragmentacao"]) > 0
