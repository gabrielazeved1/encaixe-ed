# Quickstart: Jogo "Adivinhe a Estrutura"

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Data**: 2026-10-10

Roteiro para validar a feature de ponta a ponta — do core puro ao jogo rodando no browser. Cada cenário é independentemente verificável.

---

## Pré-requisitos

- `backend/.venv` ativo, dependências instaladas (`pip install -r backend/requirements.txt`).
- `frontend/node_modules` instalado (`cd frontend && npm install`).
- Features 002 (step-player) e 003 (correções didáticas) mergeadas na `main` — pré-condição real, não configurável.
- `SECRET_KEY` do Django definida (`backend/config/settings.py` ou `.env`).

---

## Cenário 1 — Core puro passa isolado (sem Django)

**Objetivo**: confirmar que `backend/core/jogo/` é 100% testável sem Django, respeitando Princípio I.

```bash
cd backend
source .venv/bin/activate
pytest core/jogo/tests -v
```

**Esperado**:
- `test_token.py` ✅ (encode/decode, assinatura adulterada rejeitada, TTL respeitado).
- `test_sortear.py` ✅ (seed fixa → mesma rodada; sem seed → rodadas variam).
- `test_neutralidade.py` ✅ (100 rodadas sorteadas, zero vazamento).
- `test_avaliar.py` ✅ (acerto, erro, token inválido, token expirado).
- `test_explicacoes.py` ✅ (7 chaves presentes, texto não-vazio).

**Falha**: qualquer vermelho aqui impede subir para o endpoint.

---

## Cenário 2 — Endpoint `/rodada` responde curl (US1 backend)

```bash
cd backend
source .venv/bin/activate
python manage.py runserver 8000 &
sleep 1
curl -s "http://localhost:8000/api/jogo_adivinhe/rodada?seed=42" | python -m json.tool
```

**Esperado**:
- Status 200.
- Campos `token` (string com `.`) e `passos` (lista com ≥ 2 itens).
- Nenhuma substring da lista proibida (`grep -iE "pilha|fila|heap|hash|bst|linkedlist|grafo"` na resposta → sem matches, exceto se por acaso aparecer dentro do `token` em base64 — aceitável, não é texto legível pelo usuário).

**Repetir** sem `seed`: diferentes rodadas em chamadas sucessivas.

---

## Cenário 3 — Endpoint `/palpite` fecha o loop (US1 backend)

Usando o `token` do cenário 2 (com `seed=42`), o backend sempre produz a MESMA estrutura. Rodar uma vez para descobrir:

```bash
curl -s "http://localhost:8000/api/jogo_adivinhe/rodada?seed=42" > /tmp/rodada.json
TOKEN=$(python -c "import json; print(json.load(open('/tmp/rodada.json'))['token'])")

for P in pilha fila heap hash bst linkedlist grafo; do
  echo "--- $P ---"
  curl -s -X POST "http://localhost:8000/api/jogo_adivinhe/palpite" \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"$TOKEN\", \"palpite\": \"$P\"}"
  echo
done
```

**Esperado**: exatamente 1 dos 7 palpites retorna `"acertou": true`; os outros 6 retornam `false`. Em todos os casos, `estrutura_correta` e `explicacao` são preenchidos.

**Idempotência**: repetir o mesmo POST 3× → mesma resposta.

**Palpite inválido**: `-d '{"token": "...", "palpite": "treap"}'` → 400.

**Token adulterado**: trocar o último char do token → 401.

---

## Cenário 4 — US1 no browser (fluxo humano)

1. Backend rodando em `:8000`, frontend rodando em `:3000` (`cd frontend && npm run dev`).
2. Abrir `http://localhost:3000/adivinhe`.
3. **Verificar visualmente**:
   - Passos da operação visíveis com descrição + pills de destaques.
   - `StepControls` presentes (play, pause, avançar, voltar).
   - 7 botões de palpite (Pilha, Fila, Heap, Hash, BST, LinkedList, Grafo).
   - Nenhum texto na tela menciona o nome da estrutura usada na rodada.
4. Clicar em qualquer dos 7 botões.
5. **Verificar veredito**:
   - Aparece sem reload (URL permanece `/adivinhe`).
   - Mostra "Acertou" ou "Errou", a estrutura correta e a explicação.
   - Botão "Próxima" aparece.

---

## Cenário 5 — US2: próxima rodada sem reload

Continuação do cenário 4.

1. Clicar em "Próxima".
2. **Verificar**:
   - Nova rodada carrega no mesmo lugar da tela.
   - Botões de palpite voltam habilitados.
   - Veredito anterior some.
   - URL permanece `/adivinhe` (sem recarregar).
3. Repetir 10× seguidas: nenhuma falha, URL não muda.

---

## Cenário 6 — US3: seed reprodutível

1. Abrir `http://localhost:3000/adivinhe?seed=42` em duas abas (ou browsers diferentes).
2. **Verificar**: ambas carregam exatamente a mesma rodada — mesma sequência de descrições, mesmos destaques, mesmos valores.
3. Clicar "Próxima" em uma delas: a seed desaparece da URL e a próxima rodada é aleatória.

---

## Cenário 7 — US4: entrada da home

1. Abrir `http://localhost:3000/`.
2. **Verificar**: existe um card/link visível que anuncia o jogo e leva para `/adivinhe`.
3. Clicar: navega para a página do jogo.

---

## Cenário 8 — Expiração (SC-006)

Teste manual com um `TTL_SEGUNDOS` reduzido temporariamente para 5 segundos:

```python
# em backend/core/jogo/token.py, trocar TTL_SEGUNDOS = 3600 por = 5 só para o teste
```

1. `curl /rodada` → guarda token.
2. Esperar 6 segundos.
3. `curl /palpite` com esse token → 404 "rodada expirada".
4. Restaurar `TTL_SEGUNDOS = 3600`.

Alternativa automatizada: em `test_avaliar.py`, forjar token com `t = now - 3700` e assinatura válida (usar `token.encode` com timestamp controlado) → esperar `TokenExpirado`.

---

## Checklist final de aceite

- [ ] Cenário 1: pytest de `core/jogo` verde isoladamente.
- [ ] Cenário 2: GET /rodada retorna 200 e passa varredura de neutralidade.
- [ ] Cenário 3: POST /palpite fecha o loop; idempotente; 400/401/404 corretos.
- [ ] Cenário 4: fluxo US1 completo no browser.
- [ ] Cenário 5: "Próxima" sem reload.
- [ ] Cenário 6: seed reprodutível entre máquinas.
- [ ] Cenário 7: link na home.
- [ ] Cenário 8: expiração detectada.
- [ ] `pytest -q` em `backend/` 100% verde.
- [ ] `npm run test` e `npm run build` em `frontend/` 100% verde.
