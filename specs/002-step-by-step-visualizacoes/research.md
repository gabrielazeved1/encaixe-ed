# Phase 0 — Research & Decisions

**Feature**: Modo Step-by-Step nas Visualizações
**Date**: 2026-10-10

Decisões técnicas que destravam o Phase 1. Cada decisão fica aqui para quando o `/speckit-tasks` descer em código — assim nenhuma task reabre discussão.

---

## 1. Como instrumentar as estruturas puras sem acoplar a Django

**Decisão**: cada operação que precisa expor passos aceita um parâmetro opcional `coletor: list[Passo] | None = None`. Quando `None` (default), a estrutura opera "silenciosamente" como hoje. Quando uma lista é passada, cada ponto de interesse do algoritmo chama um helper interno `_registrar(coletor, descricao, destaques, estado)` que faz `coletor.append(...)`.

Padrão já usado em `stack.py` (`eventos: list[EventoDict]` passado adiante). Esta decisão apenas **generaliza e padroniza** o que já existia para pilha, estende para BST e HashTable, e troca os `tipo: str` por descrições em pt-BR + destaques.

**Rationale**:

- Zero import de Django em `core/`.
- Opção `None` preserva a API atual para quem só quer o resultado — não quebra os outros 4 projetos que compartilham as mesmas classes.
- Lista mutável evita gerador (que exigiria `yield` + consumidor, mais complexo que o necessário aqui) e evita callback (que esconde a ordem).
- Reutiliza um padrão familiar do próprio código.

**Alternatives considered**:

- **Generator com `yield`**: elegante, mas força o chamador a iterar; incompatível com funções recursivas que precisam retornar valor (ex.: `_simular_fatorial`).
- **Callback (`on_step: Callable`)**: mesma expressividade do coletor, com overhead de função e sem possibilidade trivial de inspecionar a lista pós-execução nos testes.
- **Classe "Tracer" injetada**: too much. Overkill para a necessidade.

---

## 2. Formato do campo `estado` em cada passo (envelope uniforme vs tipado por estrutura)

**Decisão**: envelope JSON uniforme no nível de passo, com `estado` como union tipada por projeto:

```json
{
  "indice": 3,
  "descricao": "Comparando chave 42 com nó raiz 30 → desce para a direita.",
  "destaques": ["no:30"],
  "estado": { ... }   // forma específica por estrutura (ver data-model.md)
}
```

- `pilha.estado`: array de frames (como `pilha_estado` atual).
- `bst.estado`: árvore serializada (reusa `BST.para_dict()`).
- `hash.estado`: lista de buckets com `(chave, valor)`.

**Rationale**:

- Campos de controle (`indice`, `descricao`, `destaques`) são iguais em todos os três → o player no frontend não precisa saber qual projeto está renderizando para controlar a reprodução.
- `estado` fica tipado pelo componente de visualização (`PilhaVisual` lê `estado as FramePilha[]`, `IndiceBstVisual` lê `estado as NoBst | null`, etc.) — TypeScript strict garante.
- `destaques` são strings opaques do tipo `"no:30"`, `"bucket:5"`, `"frame:2"` — a visualização interpreta. Mantém envelope simples; interpretação viagem no componente.

**Alternatives considered**:

- **Payload achatado por estrutura**: cada endpoint tinha seu próprio formato. Rejeitado — forçaria replicar lógica de player (índice/play/pause) por projeto.
- **GraphQL union/discriminated types**: fora da stack travada.
- **Enviar diffs em vez do estado completo**: otimização prematura. Entradas típicas do site cabem em payloads pequenos; só reavaliar se for medido como gargalo real (Assumption do spec).

---

## 3. Como gerar descrições em pt-BR sem repetição

**Decisão**: as descrições são **compostas no ponto da operação pura**, usando f-strings diretas em cada ponto de registro. Nada de template engine, nada de catálogo de mensagens, nada de i18n — o site inteiro é pt-BR por decisão de produto.

Exemplo em `bst.py`:

```python
coletor.append(fazer_passo(
    indice=len(coletor),
    descricao=f"Comparando {valor} com nó {no.valor} → desce para a {'esquerda' if valor < no.valor else 'direita'}.",
    destaques=[f"no:{no.valor}"],
    estado=self.para_dict(),
))
```

**Rationale**:

- Simplicidade. Zero camadas intermediárias.
- A descrição vive junto da lógica — se o algoritmo muda, o texto muda no mesmo diff. Impossível ficar fora de sincronia.
- Textos pedagógicos genéricos do projeto (o que é uma BST, o que é uma colisão) ficam em `content/projetos.ts` como já estão hoje; o `descricao` do passo é **operacional**, não didático.

**Alternatives considered**:

- **Catálogo `mensagens.py`**: adiciona indireção sem benefício prático em escala atual.
- **Gerar no frontend a partir do passo**: viola FR-001 e espalha lógica — a composição depende de valores que o backend já tem na mão.

---

## 4. Mecanismo de reprodução no frontend: timeout vs requestAnimationFrame

**Decisão**: `setTimeout` encadeado controlado por `useEffect`. O hook `useStepPlayer` mantém `{indice, tocando, velocidade}` em state e, enquanto `tocando`, agenda o próximo passo com `setTimeout(() => setIndice(i+1), intervalo)`.

**Rationale**:

- Intervalos de passo são da ordem de centenas de ms (0.5× ~ 2×) — `setTimeout` é mais que suficiente, mais simples que RAF, e naturalmente pausável limpando o timeout.
- Alterar velocidade durante o play (FR do spec, SC-004) é trivial: o próximo `setTimeout` usa o novo intervalo.
- Não há animação por frame a 60fps dentro do player — a animação visual fica a cargo de CSS/Framer Motion dentro dos componentes de visualização, independente do player.

**Alternatives considered**:

- **`requestAnimationFrame` loop**: overkill, custa mais complexidade, não traz benefício porque não estamos renderizando a 60fps dentro do player.
- **Biblioteca de "timeline" (ex.: gsap)**: fora da stack travada e desnecessária.

---

## 5. Como suportar step-backward sem recomputar

**Decisão**: o backend já envia **todos os passos pré-computados** em uma única resposta. "Voltar" é simplesmente `setIndice(i - 1)`. O estado da estrutura naquele passo é lido de `passos[i].estado`.

**Rationale**:

- Entrega direta de FR-006 ("sem reexecutar a operação").
- Elimina qualquer necessidade de "replay" ou "snapshot diff".
- Payload cresce linearmente com N passos, mas para as escalas da `## Technical Context` isso é aceitável (BST ≤ 50 inserções geram ~250 passos de ~200 bytes cada = ~50 KB).

**Alternatives considered**:

- **Enviar só o estado inicial e aplicar operações no frontend**: duplicaria a lógica de cada estrutura em TypeScript. Violaria "Core-First" indiretamente ao obrigar reimplementação em outra linguagem.

---

## 6. Compatibilidade com os 4 projetos não migrados

**Decisão**: contratos dos projetos **não migrados ficam intocados**. A feature só altera os payloads de `/api/pilha/simular/`, `/api/bst/comparar/` e `/api/hash/comparar/`, adicionando a chave `passos` ao JSON de resposta. Campos existentes (`frames`, `arvore`, `linear`, `hash`, …) permanecem — a visualização atual continua funcionando enquanto os componentes migram para consumir `passos`.

Após a migração completa dos três visuais, os campos legados **podem** ser removidos, mas isso é escopo de outra feature (cleanup), não desta.

**Rationale**:

- Permite rollout gradual (um visual por vez), reduz risco.
- Testes de integração dos endpoints alvos passam a validar `passos` sem precisar reescrever asserts dos campos antigos.
- Zero toque nos outros apps.

**Alternatives considered**:

- **Breaking change nos 3**: rejeitado pelo custo de orquestração (precisaria sincronizar backend + frontend no mesmo PR, impossibilitando iterações pequenas no `/speckit-tasks`).

---

## 7. Testes: granularidade esperada

**Decisão**:

- `backend/core/estruturas/tests/test_<estrutura>.py`: para cada operação instrumentada, pelo menos um teste que **enumera a sequência esperada de passos** (índice, substring da descrição, destaques) para uma entrada pequena e determinística.
- `backend/apps/<app>/tests.py`: integração — a resposta HTTP contém `passos` com schema correto; não re-testa conteúdo semântico (fica no unitário).
- `frontend/__tests__/useStepPlayer.test.ts`: play/pause/step avançando o índice, slider mudando o intervalo, auto-stop no fim.
- `frontend/__tests__/StepControls.test.tsx`: comportamento dos botões (disabled no início/fim, troca de ícone play↔pause).

**Rationale**: segue "Teste Antes do Endpoint" (Constituição IV). O unitário cobre a lógica; o integração só prova que o envelope chegou íntegro ao HTTP.

---

## Resumo das escolhas

| Área | Escolha | Trade-off |
|---|---|---|
| Instrumentação | Lista coletor opcional | Simplicidade acima de pureza funcional |
| Envelope | Comum + `estado` tipado por projeto | Reusabilidade do player no custo de union discriminada no frontend |
| Descrições | f-strings in-place em pt-BR | Zero indireção; se futuramente houver i18n, extrair aqui |
| Reprodução | `setTimeout` encadeado | Simplicidade acima de precisão de frame |
| Step-backward | Replay via `passos[i].estado` | Payload linear em N, aceitável nas escalas atuais |
| Compat | Campos legados preservados | Payload inchado temporariamente até cleanup |
