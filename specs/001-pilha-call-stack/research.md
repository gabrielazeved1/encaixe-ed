# Research: Visualizador de Pilha de Chamadas

**Phase 0 — Resolução de incógnitas**
**Date**: 2026-09-12

## Decisões técnicas

### Algoritmo de simulação recursiva

**Decision**: Simular a pilha de chamadas via travessia DFS recursiva instrumentada,
acumulando eventos push/pop em uma lista antes de retornar ao frontend.

**Rationale**: A abordagem instrumentada (decorar a chamada recursiva para registrar
eventos) produz a sequência exata de push/pop sem depender de introspection do runtime.
É determinística, testável isoladamente e não introduz dependência de framework.

**Alternatives considered**:
- `sys.getframe()` / `traceback` do Python: acoplado ao runtime CPython, difícil de
  controlar e testar.
- Simulação iterativa com stack explícita: possível, mas obscurece o relacionamento
  direto entre a estrutura Pilha e a recursão — que é justamente o ponto educacional.

---

### Representação de eventos

**Decision**: Cada evento carrega: tipo (`push`/`pop`/`overflow`), nome da função,
argumento, retorno (apenas em `pop`), profundidade e snapshot do estado completo da
pilha naquele momento.

**Rationale**: O snapshot por evento permite ao frontend animar qualquer passo sem
precisar recalcular o estado — a animação é um player sobre uma lista imutável.

**Alternatives considered**:
- Enviar apenas deltas (só o frame que mudou): reduz payload mas exige lógica de
  reconstituição no frontend, violando Princípio V.

---

### Limite de profundidade (MAX_DEPTH)

**Decision**: `MAX_DEPTH = 50`. Quando a pilha atinge 50 frames simultâneos, um evento
`overflow` é emitido e a simulação para.

**Rationale**: 50 é visualmente significativo (a animação mostra uma pilha crescendo
até o limite), suficiente para demonstrar o conceito sem sobrecarregar o frontend com
centenas de frames. Fibonacci(10) gera 177 eventos — aceitável. Fibonacci(20) geraria
mais de 20.000 — não aceitável para animação.

**Alternatives considered**:
- `MAX_DEPTH = 100`: aumenta o payload do Fibonacci exponencialmente.
- Limite por número de eventos (não de profundidade simultânea): não demonstra o
  conceito de "pilha cheia" de forma tão direta.

---

### Fibonacci — abordagem da árvore de chamadas

**Decision**: Simular a árvore de chamadas recursiva completa do Fibonacci ingênuo
(sem memoização), mostrando todas as chamadas duplicadas.

**Rationale**: O objetivo educacional é mostrar exatamente por que a recursão ingênua
é ineficiente — as chamadas duplicadas são o ponto central, não um defeito a esconder.

**Alternatives considered**:
- Fibonacci com memoização: mais eficiente, mas destrói o argumento visual.
- Fibonacci iterativo: não usa pilha de chamadas — fora do escopo.

---

### Intervalo de entrada válida

**Decision**: `fatorial`: 1–12 sem overflow (13! > int de 32 bits, mas Python trata
big int nativamente — usar limite de profundidade 50 como barreira). `fibonacci`: 1–15
como sugestão de "uso normal"; qualquer valor maior pode atingir MAX_DEPTH rapidamente.
Validação rejeita valores < 1 ou não-inteiros.

**Rationale**: Não impor limite artificial além do MAX_DEPTH — deixar o próprio sistema
demonstrar o overflow para valores grandes, que é o comportamento educativo desejado.

---

### Sem estado entre sessões

**Decision**: Toda simulação é calculada a cada requisição, sem cache ou persistência.

**Rationale**: Alinhado com Restrições de Infraestrutura da constituição. Simulações
são rápidas o suficiente para não justificar cache.
