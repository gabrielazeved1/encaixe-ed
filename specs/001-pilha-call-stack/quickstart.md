# Quickstart & Validation Guide: Pilha

**Date**: 2026-09-12
**Spec**: [spec.md](spec.md) | **Contrato**: [contracts/api.md](contracts/api.md)

---

## Pré-requisitos

```bash
# Python 3.14.7 via pyenv (verificar)
python --version   # → Python 3.14.7

# Backend — criar e ativar virtualenv (uma vez)
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt

# Node (frontend)
cd frontend && npm install
```

---

## Validação do backend (pytest)

```bash
# Da raiz do projeto, com virtualenv ativo:
source backend/.venv/bin/activate

# 1. Estrutura pura — deve passar antes de qualquer endpoint
pytest backend/core/estruturas/tests/test_stack.py -v

# 2. Endpoint de integração
pytest backend/apps/pilha/tests.py -v
```

**Resultados esperados:**

| Teste | Resultado esperado |
| ----- | ------------------ |
| `test_push_aumenta_pilha` | PASSED |
| `test_pop_retorna_topo` | PASSED |
| `test_pop_em_pilha_vazia_levanta_excecao` | PASSED |
| `test_simular_fatorial_retorna_frames_corretos` | PASSED |
| `test_simular_fibonacci_retorna_frames_corretos` | PASSED |
| `test_overflow_detectado_apos_max_depth` | PASSED |
| `test_endpoint_rejeita_valor_invalido` | PASSED |

---

## Validação do endpoint (curl)

```bash
# Iniciar servidor
cd backend && python manage.py runserver

# Fatorial(4) — deve retornar 8 eventos (4 push + 4 pop), status "completo"
curl -s -X POST http://localhost:8000/api/pilha/simular/ \
  -H "Content-Type: application/json" \
  -d '{"funcao": "fatorial", "valor": 4}' | python -m json.tool

# Fibonacci(5) — deve retornar múltiplos eventos com chamadas duplicadas
curl -s -X POST http://localhost:8000/api/pilha/simular/ \
  -H "Content-Type: application/json" \
  -d '{"funcao": "fibonacci", "valor": 5}' | python -m json.tool

# Overflow — deve retornar status "overflow" com último evento tipo "overflow"
curl -s -X POST http://localhost:8000/api/pilha/simular/ \
  -H "Content-Type: application/json" \
  -d '{"funcao": "fibonacci", "valor": 100}' | python -m json.tool

# Entrada inválida — deve retornar HTTP 400
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/api/pilha/simular/ \
  -H "Content-Type: application/json" \
  -d '{"funcao": "fatorial", "valor": -1}'
# → 400
```

---

## Validação do frontend

```bash
cd frontend && npm run dev
# Abrir http://localhost:3000/projetos/pilha
```

**Checklist visual:**

- [ ] Formulário exibe os campos "Função" (select) e "Valor" (input numérico)
- [ ] Submeter fatorial(4) inicia animação com 4 frames empilhando e 4 desempilhando
- [ ] Cada frame exibe nome da função e argumento; no pop, exibe o valor retornado
- [ ] Submeter fibonacci(100) exibe animação até o overflow com sinalização visual clara
- [ ] Valor inválido (-1, texto) mostra erro sem chegar ao servidor
- [ ] Seção "Sobre esta estrutura" está visível abaixo da demo
- [ ] Seção "Onde isso aparece na faculdade" lista Arquitetura de Computadores e SO

---

## Critérios de aceite (da spec)

| SC | Critério | Como verificar |
| -- | -------- | -------------- |
| SC-001 | Resultado em < 2s | DevTools → Network, checar tempo de resposta do POST |
| SC-002 | 100% dos eventos animados corretamente | Comparar contagem de frames no JSON com frames exibidos |
| SC-003 | Overflow sinalizado visualmente | Testar com fibonacci(100), verificar sinalização na UI |
| SC-004 | Entradas inválidas rejeitadas no cliente | Tentar submeter valor negativo, verificar que POST não é feito |
| SC-005 | Seções educativas legíveis em desktop e mobile | Testar em 1440px e 375px de largura |
