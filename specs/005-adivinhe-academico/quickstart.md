# Quickstart — Jogo Adivinhe Modo Acadêmico

Guia de validação end-to-end da feature 005. Rode cada cenário em sequência; marque como validado quando passar.

---

## Pré-requisitos

```bash
# Backend
cd backend
source .venv/bin/activate
pytest -q                              # deve mostrar >= 256 testes verdes (base atual + novos)
python manage.py runserver             # terminal A

# Frontend (terminal B)
cd frontend
npm install
npm run build                          # tipagem + lint
npm test -- --run                      # vitest em single-run
npm run dev                            # http://localhost:3000
```

Ao final de ambos os servidores subindo:
- Backend em `http://localhost:8000`
- Frontend em `http://localhost:3000`

---

## Cenário 1 — Baseline (ambiente verde)

**Objetivo:** garantir que o setup está consistente.

**Passos:**
1. Rode `pytest -q` em `backend/` — todos verdes (255+).
2. Rode `npm test -- --run` em `frontend/` — todos verdes.
3. Rode `curl http://localhost:8000/api/jogo_adivinhe/rodada?seed=0 | jq .` — deve retornar `{token, passos, pergunta_estrutura}`.

**Esperado:** `pergunta_estrutura.camada == "estrutura"`, `len(pergunta_estrutura.alternativas) == 4`.

- [ ] Validado

---

## Cenário 2 — Fluxo completo end-to-end (US1 — P1)

**Objetivo:** responder 1 rodada completa pela UI e ver 3 cards no veredito.

**Passos:**
1. Acesse `http://localhost:3000/adivinhe`.
2. Observe que a tela tem 2 colunas: passos à esquerda, pergunta à direita.
3. Observe que o indicador no topo mostra "Pergunta 1 de 3" com 3 dots (o 1º destacado).
4. Navegue pelos passos com `→` ou botão "Próximo passo".
5. Clique na alternativa A, B, C ou D (ou pressione `1`-`4` no teclado).
6. Confirme (botão "Confirmar" ou tecla `Enter`).
7. Observe transição suave para a pergunta 2 (operação). Progresso: "Pergunta 2 de 3".
8. Repita para a pergunta 2 e 3.
9. Observe a tela de veredito final: 3 cards horizontais (estrutura/operação/complexidade), cada um com ✓/✕ + resposta correta + explicação. Pontuação 0–3 estrelas no topo.
10. Clique em "Próxima rodada" — nova rodada carrega sem recarregar a página.

**Esperado:** fluxo roda sem erro; cada pergunta tem exatamente 4 alternativas; cada card do veredito tem explicação de 2–3 linhas.

- [ ] Validado

---

## Cenário 3 — Neutralidade dos passos e enunciados (SC-002)

**Objetivo:** verificar que não há vazamento de nome.

**Passos:**
1. Em DevTools (F12 → Network), capture a response de `GET /rodada` e `POST /palpite` (estágio estrutura).
2. Rode no console do browser: `const txt = JSON.stringify(responseRodada.passos) + responseRodada.pergunta_estrutura.enunciado; ["pilha","fila","heap","hash","bst","linkedlist","grafo","stack","queue","dijkstra","bfs","monte","árvore binária","lista encadeada"].forEach(w => { if (txt.toLowerCase().includes(w)) console.error("VAZOU:", w) });`
3. Esperado: nenhum output no console.

**Esperado:** zero vazamentos.

- [ ] Validado

---

## Cenário 4 — Teclado (US2)

**Objetivo:** completar uma rodada sem usar o mouse.

**Passos:**
1. Abra `http://localhost:3000/adivinhe`.
2. Use só o teclado:
   - `→` / `espaço`: avança passo.
   - `←`: volta passo.
   - `1` / `2` / `3` / `4`: seleciona alternativa A/B/C/D.
   - `Enter`: confirma.
3. Complete a rodada inteira sem clicar.

**Esperado:** rodada completável só com teclado.

- [ ] Validado

---

## Cenário 5 — Reprodutibilidade por seed (herdado FR-018)

**Objetivo:** mesma seed → mesma rodada.

**Passos:**
1. Abra `http://localhost:3000/adivinhe?seed=42` em uma aba.
2. Abra o mesmo link em outra aba.
3. Compare os passos exibidos: devem ser idênticos.
4. Compare os 3 enunciados e a ordem das alternativas: idênticos.

**Esperado:** rodadas idênticas bit-a-bit.

- [ ] Validado

---

## Cenário 6 — Banco de perguntas variado (US3)

**Objetivo:** confirmar que o banco tem variedade.

**Passos:**
1. Script Python manual:
   ```python
   from core.jogo.perguntas import BANCO
   for (e, c), lista in sorted(BANCO.items()):
       assert len(lista) >= 2, f"({e}, {c}) tem só {len(lista)} enunciados"
       for p in lista:
           assert len(p.alternativas) == 4
           assert 0 <= p.indice_correto < 4
   print(f"OK: {sum(len(v) for v in BANCO.values())} enunciados cadastrados")
   ```
2. Esperado: ≥42 enunciados.

**Esperado:** script imprime "OK: 42+" sem erro.

- [ ] Validado

---

## Cenário 7 — Veredito acadêmico (US4)

**Objetivo:** validar qualidade das explicações.

**Passos:**
1. Jogue 7 rodadas (uma por estrutura, via seed controlada):
   - `?seed=10` (heap), `?seed=20` (bst), `?seed=30` (pilha), `?seed=40` (fila), `?seed=50` (hash), `?seed=60` (linkedlist), `?seed=70` (grafo). _Ajuste as seeds após inspecionar quais caem em cada estrutura._
2. Para cada rodada, no veredito final leia os 3 cards.
3. Verifique:
   - Cada explicação tem 2–3 linhas (não 1 palavra).
   - Cita o nome real da estrutura (ex.: "monte binário", "árvore de busca binária").
   - Menciona a invariante formal.
   - Comenta um distrator quando aplicável.

**Esperado:** 7 rodadas × 3 explicações = 21 textos, todos com qualidade acadêmica.

- [ ] Validado

---

## Cenário 8 — Token expirado (edge case)

**Objetivo:** token com TTL excedido retorna 404.

**Passos:**
1. Reduza `TTL_SEGUNDOS = 2` em `backend/core/jogo/token.py` **temporariamente**.
2. Reinicie `runserver`.
3. Pegue um token: `curl 'http://localhost:8000/api/jogo_adivinhe/rodada?seed=0' | jq -r .token > /tmp/tok.txt`.
4. Aguarde 3 segundos.
5. Palpite: `curl -X POST ... -d '{"token":"'$(cat /tmp/tok.txt)'","estagio":"estrutura","palpite":"foo"}'`.
6. Esperado: HTTP 404 com `{"detail": "rodada expirada"}`.
7. Restaure `TTL_SEGUNDOS = 3600` ao final.

**Alternativa (sem alterar código):** confirmar que `test_palpite_token_expirado_retorna_404` em `apps/jogo_adivinhe/tests.py` cobre esse caminho e passa.

- [ ] Validado

---

## Cenário 9 — Palpite inválido

**Objetivo:** backend rejeita palpite que não bate com nenhuma alternativa.

**Passos:**
```bash
TOKEN=$(curl -s 'http://localhost:8000/api/jogo_adivinhe/rodada?seed=0' | jq -r .token)
curl -X POST http://localhost:8000/api/jogo_adivinhe/palpite \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"estagio\":\"estrutura\",\"palpite\":\"xyz\"}"
```

**Esperado:** HTTP 400 com `{"detail": "palpite inválido"}`.

- [ ] Validado

---

## Cenário 10 — Zero regressão

**Objetivo:** nenhum teste das features 001–004 quebrou.

**Passos:**
1. `cd backend && pytest -q` — todos verdes.
2. `cd frontend && npm test -- --run` — todos verdes.
3. Testar manualmente 1 projeto antigo (ex.: `/projetos/pilha-call-stack`) — deve funcionar normalmente.

**Esperado:** suíte estável, nenhuma UI de projeto antigo quebrada.

- [ ] Validado

---

## Checklist consolidado

- [ ] 1. Baseline
- [ ] 2. Fluxo completo
- [ ] 3. Neutralidade
- [ ] 4. Teclado
- [ ] 5. Seed reprodutível
- [ ] 6. Banco variado
- [ ] 7. Explicações acadêmicas
- [ ] 8. Token expirado
- [ ] 9. Palpite inválido
- [ ] 10. Zero regressão
