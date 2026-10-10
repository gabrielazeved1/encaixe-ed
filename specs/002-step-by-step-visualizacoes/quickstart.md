# Quickstart — Validação End-to-End

**Feature**: Modo Step-by-Step nas Visualizações
**Date**: 2026-10-10

Guia executável para provar que a feature funciona ponta a ponta. Cada cenário referencia o contrato e o success criterion que valida.

---

## Pré-requisitos

```bash
# Backend
source backend/.venv/bin/activate
pip install -r backend/requirements.txt   # se necessário

# Frontend
cd frontend && npm install                 # se necessário
```

---

## Cenário 1 — Backend emite passos para `pilha`

**Valida**: contratos/api-pilha.md · FR-001 · FR-002 · FR-013

```bash
source backend/.venv/bin/activate
pytest backend/core/estruturas/tests/test_stack.py -k passos -v
```

**Esperado**: todos os asserts passam. Pelo menos um teste verifica que `simular_pilha("fatorial", 3, coletor=p)` popula `p` com uma lista de `Passo` com índices densos e descrições não-vazias.

Verificação manual via HTTP:

```bash
cd backend && python manage.py runserver &
curl -s -X POST http://localhost:8000/api/pilha/simular/ \
  -H 'Content-Type: application/json' \
  -d '{"funcao":"fatorial","valor":3}' | jq '.passos | length, .passos[0]'
```

**Esperado**: `length >= 6` e o primeiro passo tem `indice: 0`, `descricao` não-vazia em pt-BR.

---

## Cenário 2 — Backend emite passos para `indice_bst` cobrindo inserção + busca

**Valida**: contratos/api-bst.md · FR-001 · FR-003

```bash
pytest backend/core/estruturas/tests/test_bst.py -k passos -v
```

Verificação manual:

```bash
curl -s -X POST http://localhost:8000/api/bst/comparar/ \
  -H 'Content-Type: application/json' \
  -d '{"valores":[50,30,70],"alvo":30}' | jq '.passos[].descricao'
```

**Esperado**: lista de descrições iniciando por "Árvore vazia. Inserindo 50..." e terminando com uma descrição de busca por 30.

---

## Cenário 3 — Backend descreve colisões em `busca_hash`

**Valida**: contratos/api-hash.md · FR-001 · FR-003

```bash
pytest backend/core/estruturas/tests/test_hash_table.py -k colisao -v
```

Verificação manual:

```bash
curl -s -X POST http://localhost:8000/api/hash/comparar/ \
  -H 'Content-Type: application/json' \
  -d '{"dados":[{"chave":"ana","valor":1},{"chave":"zoe","valor":2}],"chave":"ana"}' \
  | jq '[.passos[] | select(.descricao | contains("Colisão"))] | length'
```

**Esperado**: `≥ 1` se a entrada força colisão com a função hash atual (ou `0` caso contrário — ajustar a entrada no teste para forçar colisão determinística).

---

## Cenário 4 — Frontend: `useStepPlayer` controla reprodução

**Valida**: SC-001 · SC-003 · SC-004

```bash
cd frontend && npm run test -- useStepPlayer
```

**Esperado**: todos os testes passam. Casos cobertos:

- Começa em `indice=0`, `tocando=false`.
- `avancar()` incrementa índice; `voltar()` decrementa.
- `tocar()` começa auto-play; depois de `n * intervalo` ms, índice avançou `n` posições.
- Mudar `velocidade` durante play afeta o próximo `setTimeout`.
- Ao atingir último passo em auto-play, `tocando` volta a `false`.

---

## Cenário 5 — Frontend: visualização renderiza passo atual

**Valida**: SC-002 · SC-005 · User Stories 1 e 3

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:3000/projetos/indice-bst`, preencher o formulário com `[50, 30, 70, 40]` buscando `40`, submeter, então:

1. Visualização inicia pausada no passo 0 com a árvore vazia.
2. Clicar "próximo" uma vez: estado passa a mostrar a inserção da raiz; barra lateral exibe texto correspondente.
3. Clicar "próximo" até o final; cada clique atualiza visual + texto atomicamente.
4. Clicar "voltar": retorna ao estado anterior sem recarregar.
5. Clicar "play": avança automaticamente; mover slider acelera/desacelera visivelmente.
6. Chegar ao fim: botão "próximo" fica desabilitado.

Repetir em `/projetos/pilha` e `/projetos/busca-hash`.

---

## Done When

- [ ] Todos os `pytest` relevantes passam
- [ ] Todos os `vitest` relevantes passam
- [ ] Verificação visual nos três projetos reproduz o fluxo do Cenário 5
- [ ] Nenhum console error no browser durante a reprodução
- [ ] `curl` dos três endpoints retorna `passos` conforme contratos
