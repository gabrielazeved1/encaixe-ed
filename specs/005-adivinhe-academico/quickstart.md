# Quickstart — Jogo Adivinhe Modo Acadêmico

Guia de validação end-to-end da feature 005. Rode cada cenário em sequência; marque como validado quando passar.

---

## Pré-requisitos

```bash
# Backend
cd backend
source .venv/bin/activate
pytest -q                              # deve mostrar >= 290 testes verdes
python manage.py runserver             # terminal A

# Frontend (terminal B)
cd frontend
npm install
npm run build                          # tipagem + lint (0 erros TypeScript)
npm test -- --run                      # vitest em single-run (>= 50 testes)
npm run dev                            # http://localhost:3000
```

Ao final de ambos os servidores subindo:
- Backend em `http://localhost:8000`
- Frontend em `http://localhost:3000`

---

## Cenário 1 — Baseline (ambiente verde)

**Objetivo:** garantir que o setup está consistente.

**Passos:**
1. Rode `pytest -q` em `backend/` — todos verdes (290 testes).
2. Rode `npm test -- --run` em `frontend/` — todos verdes (50 testes).
3. Rode `npm run build` em `frontend/` — sem erros TypeScript.
4. Rode `curl http://localhost:8000/api/jogo_adivinhe/rodada?seed=0 | jq .` — deve retornar `{token, estrutura, passos, perguntas, pergunta_estrutura}`.

**Esperado:** `perguntas` é array com 3 elementos; cada elemento tem `camada`, `enunciado`, `alternativas` (4 itens), `indice_correto`, `explicacao_acerto`, `explicacao_erro`.

- [ ] Validado

---

## Cenário 2 — Fluxo completo end-to-end (US1 — P1)

**Objetivo:** jogar 1 rodada completa pela UI e ver o resultado inline nos 3 cards.

**Passos:**
1. Acesse `http://localhost:3000/adivinhe`.
2. Observe o layout em 2 colunas: à esquerda, animação SVG da estrutura sorteada; à direita, 3 cards de perguntas com badges **Fácil** / **Médio** / **Difícil**.
3. Navegue pelos passos da animação com `←` / `→` (ou botões) para observar a estrutura sem nome revelado.
4. Selecione uma alternativa no card 1 (estrutura), uma no card 2 (operação) e uma no card 3 (complexidade).
5. Observe que o botão **"Verificar respostas"** só fica ativo quando as 3 perguntas estão respondidas.
6. Clique em **"Verificar respostas"**.
7. Observe o resultado inline em cada card: ✓ verde (acerto) ou ✗ vermelho (erro) + resposta correta destacada + explicação acadêmica.
8. Observe a pontuação ★★★ exibida (0–3 estrelas).
9. Clique em **"Nova rodada →"** — nova rodada carrega sem recarregar a página.

**Esperado:** fluxo roda sem erro; verificação é instantânea (sem chamada de rede); cada card mostra explicação de 2–3 linhas.

- [ ] Validado

---

## Cenário 3 — Neutralidade dos passos e enunciados (SC-002)

**Objetivo:** verificar que não há vazamento de nome.

**Passos:**
1. Em DevTools (F12 → Network), capture a response de `GET /rodada`.
2. Rode no console do browser:
   ```js
   const r = /* response de /rodada */;
   const txt = JSON.stringify(r.passos) + r.perguntas[0].enunciado;
   ["pilha","fila","heap","hash","bst","linkedlist","grafo","stack","queue","dijkstra","bfs","monte","árvore binária","lista encadeada"].forEach(w => {
     if (txt.toLowerCase().includes(w)) console.error("VAZOU:", w);
   });
   ```
3. Esperado: nenhum output no console.

**Esperado:** zero vazamentos nos passos e no enunciado da pergunta de estrutura.

- [ ] Validado

---

## Cenário 4 — Teclado (US2) — ← → apenas; 1-4 removidos por design

**Objetivo:** navegar passos com teclado; confirmar ausência dos atalhos 1-4.

**Passos:**
1. Abra `http://localhost:3000/adivinhe`.
2. Use `→` e `←` para navegar entre os passos da animação SVG — deve funcionar.
3. Tente pressionar `1`, `2`, `3`, `4` — **não deve selecionar alternativas** (atalhos removidos pelo redesign; os 3 cards simultâneos tornam o atalho ambíguo).
4. Selecione respostas nos 3 cards via mouse/toque.
5. Clique "Verificar respostas".

**Esperado:** ← → navegam passos. Teclas 1-4 não fazem nada (design intencional). A rodada requer mouse/toque para seleção de alternativas.

- [ ] Validado

---

## Cenário 5 — Reprodutibilidade por seed (herdado FR-018)

**Objetivo:** mesma seed → mesma rodada.

**Passos:**
1. Abra `http://localhost:3000/adivinhe?seed=42` em uma aba.
2. Abra o mesmo link em outra aba.
3. Compare os passos exibidos: devem ser idênticos.
4. Compare os 3 enunciados e a ordem das alternativas: idênticos.
5. Confirme que `indice_correto` é o mesmo nos dois.

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

**Objetivo:** validar qualidade das explicações inline nos cards.

**Passos:**
1. Jogue 7 rodadas (uma por estrutura, via seed controlada):
   - `?seed=10`, `?seed=20`, `?seed=30`, `?seed=40`, `?seed=50`, `?seed=60`, `?seed=70`. _Ajuste as seeds após inspecionar quais caem em cada estrutura._
2. Para cada rodada, após clicar "Verificar respostas", leia as explicações em cada card.
3. Verifique:
   - Cada explicação tem 2–3 linhas (não 1 palavra).
   - Cita o nome real da estrutura (ex.: "monte binário", "árvore de busca binária").
   - Menciona a invariante formal.
   - Comenta um distrator quando aplicável.

**Esperado:** 7 rodadas × 3 explicações = 21 textos, todos com qualidade acadêmica.

- [ ] Validado

---

## Cenário 8 — Token expirado (edge case — testa backend /palpite, não fluxo normal)

**Objetivo:** token com TTL excedido retorna 404 no endpoint `/palpite`.

> **Nota:** este cenário testa o endpoint `/palpite` no backend diretamente via curl. O frontend na versão final não chama `/palpite`, então este edge case não afeta o fluxo normal da UI.

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

## Cenário 9 — Palpite inválido (edge case — testa backend /palpite, não fluxo normal)

**Objetivo:** backend rejeita palpite que não bate com nenhuma alternativa.

> **Nota:** este cenário testa o endpoint `/palpite` no backend diretamente via curl. O frontend na versão final não chama `/palpite`.

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
1. `cd backend && pytest -q` — todos os 290 verdes.
2. `cd frontend && npm test -- --run` — todos os 50 verdes.
3. `cd frontend && npm run build` — 0 erros TypeScript.
4. Testar manualmente 1 projeto antigo (ex.: `/projetos/pilha-call-stack`) — deve funcionar normalmente.

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
- [ ] 8. Token expirado (backend /palpite)
- [ ] 9. Palpite inválido (backend /palpite)
- [ ] 10. Zero regressão
