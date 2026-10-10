# Contract: POST /api/escalonador

**Status**: Inalterado.

## Request

Mesmo payload atual.

## Response (200 OK)

Mesmo shape JSON atual.

## Alterações desta feature

Nenhuma. O escalonador consome `MinHeap` via `from core.estruturas.heap import MinHeap`. A reescrita do heap é interna — API pública (`push`, `pop`, `peek`, `is_empty`, `__len__`) e comportamento (ordem, tie-break FIFO, exceções) permanecem idênticos.

## Compatibilidade

Frontend atual continua funcionando sem modificação.

## Teste de aceitação

Rodar `pytest backend/apps/escalonador/tests.py` depois da reescrita do heap. Todos os testes atuais devem passar sem alteração.
