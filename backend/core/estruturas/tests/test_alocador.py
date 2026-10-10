from core.estruturas.alocador import Alocador, MEMORIA_TOTAL, simular_alocador


def test_alocar_reduz_espaco_livre() -> None:
    a = Alocador()
    a.alocar(64)
    estado = a.estado()
    assert estado["livre_total"] == MEMORIA_TOTAL - 64
    assert estado["usado_total"] == 64


def test_liberar_aumenta_espaco_livre() -> None:
    a = Alocador()
    bloco = a.alocar(64)
    assert bloco is not None
    a.liberar(int(bloco["id"]))
    assert a.estado()["livre_total"] == MEMORIA_TOTAL


def test_alocar_sem_espaco_retorna_none() -> None:
    a = Alocador()
    a.alocar(MEMORIA_TOTAL)
    assert a.alocar(1) is None


def test_coalescer_une_blocos_adjacentes() -> None:
    a = Alocador()
    b1 = a.alocar(64)
    b2 = a.alocar(64)
    assert b1 is not None and b2 is not None
    a.liberar(int(b1["id"]))
    a.liberar(int(b2["id"]))
    estado = a.estado()
    blocos = estado["blocos"]
    assert isinstance(blocos, list)
    livres = [b for b in blocos if b["livre"]]
    assert len(livres) == 1
    assert livres[0]["tamanho"] == MEMORIA_TOTAL


def test_fragmentacao_aumenta_com_liberacoes() -> None:
    a = Alocador()
    b1 = a.alocar(64)
    b2 = a.alocar(64)
    b3 = a.alocar(64)
    assert b1 is not None and b2 is not None and b3 is not None
    a.liberar(int(b1["id"]))
    a.liberar(int(b3["id"]))
    estado = a.estado()
    assert float(estado["fragmentacao"]) > 0


def test_simular_alocador_executa_operacoes_em_sequencia() -> None:
    operacoes = [
        {"tipo": "alocar", "tamanho": 64},
        {"tipo": "alocar", "tamanho": 128},
        {"tipo": "liberar", "bloco_id": 0},
    ]
    resultado = simular_alocador(operacoes)
    assert resultado["total_operacoes"] == 3
    assert isinstance(resultado["estados"], list)
    assert len(resultado["estados"]) == 3
