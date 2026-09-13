import pytest
from core.estruturas.stack import Stack, simular_pilha


def test_push_aumenta_tamanho() -> None:
    s: Stack[int] = Stack()
    s.push(1)
    s.push(2)
    assert len(s) == 2


def test_pop_retorna_e_remove_topo() -> None:
    s: Stack[int] = Stack()
    s.push(10)
    s.push(20)
    assert s.pop() == 20
    assert len(s) == 1


def test_peek_nao_remove() -> None:
    s: Stack[int] = Stack()
    s.push(42)
    assert s.peek() == 42
    assert len(s) == 1


def test_is_empty() -> None:
    s: Stack[int] = Stack()
    assert s.is_empty()
    s.push(1)
    assert not s.is_empty()


def test_pop_em_pilha_vazia_levanta_excecao() -> None:
    s: Stack[int] = Stack()
    with pytest.raises(IndexError):
        s.pop()


def test_fatorial_4_gera_8_eventos() -> None:
    result = simular_pilha("fatorial", 4)
    assert result["status"] == "completo"
    eventos = result["frames"]
    pushes = [e for e in eventos if e["tipo"] == "push"]
    pops = [e for e in eventos if e["tipo"] == "pop"]
    assert len(pushes) == 4
    assert len(pops) == 4


def test_fatorial_retorna_valor_correto_no_ultimo_pop() -> None:
    result = simular_pilha("fatorial", 5)
    pops = [e for e in result["frames"] if e["tipo"] == "pop"]
    ultimo_pop = pops[-1]
    assert ultimo_pop["frame"]["retorno"] == 120


def test_fatorial_1_gera_2_eventos() -> None:
    result = simular_pilha("fatorial", 1)
    assert len(result["frames"]) == 2
    assert result["frames"][0]["tipo"] == "push"
    assert result["frames"][1]["tipo"] == "pop"


def test_fibonacci_5_tem_chamadas_duplicadas() -> None:
    result = simular_pilha("fibonacci", 5)
    assert result["status"] == "completo"
    pushes = [e for e in result["frames"] if e["tipo"] == "push"]
    # fibonacci(5) gera 15 chamadas na recursão ingênua
    assert len(pushes) == 15


def test_fibonacci_1_retorna_1() -> None:
    result = simular_pilha("fibonacci", 1)
    pops = [e for e in result["frames"] if e["tipo"] == "pop"]
    assert pops[-1]["frame"]["retorno"] == 1


def test_overflow_emitido_apos_max_depth() -> None:
    result = simular_pilha("fibonacci", 100, max_depth=10)
    assert result["status"] == "overflow"
    ultimo = result["frames"][-1]
    assert ultimo["tipo"] == "overflow"


def test_pilha_estado_vazia_apos_overflow_no_final() -> None:
    result = simular_pilha("fibonacci", 100, max_depth=5)
    assert result["status"] == "overflow"


def test_valor_invalido_levanta_value_error() -> None:
    with pytest.raises(ValueError):
        simular_pilha("fatorial", -1)


def test_funcao_invalida_levanta_value_error() -> None:
    with pytest.raises(ValueError):
        simular_pilha("mergesort", 5)
