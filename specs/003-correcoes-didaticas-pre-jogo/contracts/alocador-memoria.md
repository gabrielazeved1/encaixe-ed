# Contract: POST /api/alocador_memoria

**Status**: Inalterado — rename de módulo não altera contrato público.

## Request

Mesmo payload atual. Nenhuma alteração.

## Response (200 OK)

Mesmo shape JSON atual. Nenhuma alteração.

## Alterações desta feature

Nenhuma alteração de contrato. A única mudança no backend é interna:

- `backend/apps/alocador_memoria/views.py` troca `from core.estruturas.linked_list import Alocador` por `from core.estruturas.alocador import Alocador`.

## Compatibilidade

Frontend atual (`hooks/useAlocadorMemoria.ts` + `components/projetos/AlocadorVisual.tsx`) continua funcionando sem modificação.

## Teste de aceitação

```bash
# Depois do split, rodar o endpoint com o mesmo payload de antes:
curl -X POST http://localhost:8000/api/alocador_memoria \
  -H "Content-Type: application/json" \
  -d '{"capacidade": 64, "operacoes": [...]}'

# A resposta deve ser byte-a-byte idêntica à de antes do rename.
```
