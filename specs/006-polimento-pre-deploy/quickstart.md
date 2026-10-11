# Quickstart: Polimento Pré-Deploy

**Feature**: `006-polimento-pre-deploy` | **Date**: 2026-10-11

## Validações por entrega

### 1. Gitignore limpo

```bash
# Após o commit de limpeza:
git ls-files .specify/ .claude/
# Esperado: nenhuma saída (zero arquivos rastreados)

git status
# .specify/ e .claude/ NÃO devem aparecer como untracked
```

### 2. README

Abrir `README.md` e confirmar presença de:
- [ ] Descrição do projeto
- [ ] Link para deploy em produção (Vercel)
- [ ] Pré-requisitos (Python 3.14+, Node 18+)
- [ ] Instruções de setup (backend e frontend)
- [ ] Tabela de stack
- [ ] Estrutura de pastas resumida

### 3. Imagem OG

```bash
# Verificar arquivo criado
ls frontend/public/og.png

# Testar metadata no browser (após npm run dev):
# Abrir http://localhost:3000 → View Source → buscar "og:image"
# Esperado: <meta property="og:image" content="...og.png" />
```

Validação externa: colar o URL de produção em https://opengraph.xyz ou similar.

### 4. Página Sobre — frase removida

```bash
grep -r "cada capítulo gerou um projeto" frontend/
# Esperado: nenhuma saída
```

Verificação visual: acessar `/sobre` → seção "Origem" → confirmar que o parágrafo da frase não existe.

### 5. Home — perguntas contextuais

Acessar `http://localhost:3000`:
- [ ] Os 7 projetos aparecem em uma seção visível antes de rolar a página
- [ ] Cada projeto exibe sua pergunta contextual
- [ ] Clicar em cada item navega para `/projetos/[slug]`
- [ ] Layout não quebra em mobile (DevTools → toggle device)

### 6. Deploy end-to-end

**Variáveis de ambiente necessárias**:

| Variável | Onde configurar | Valor |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel → Settings → Environment Variables | URL do Render (ex: `https://encaixe-api.onrender.com`) |
| `CORS_ALLOWED_ORIGINS` | Render → Environment | URL do Vercel (ex: `https://encaixe.vercel.app`) |
| `SECRET_KEY` | Render → Environment | Chave Django segura |
| `DEBUG` | Render → Environment | `False` |
| `ALLOWED_HOSTS` | Render → Environment | `encaixe-api.onrender.com` |

**Validação pós-deploy**:
```bash
# Checar que o frontend não chama localhost
curl https://encaixe.vercel.app | grep localhost
# Esperado: nenhuma saída

# Checar que a API responde
curl -X POST https://encaixe-api.onrender.com/api/pilha/ \
  -H "Content-Type: application/json" \
  -d '{"funcao": "fatorial", "n": 5}'
# Esperado: HTTP 200 com JSON de resultado

# Checar CORS
curl -I -H "Origin: https://encaixe.vercel.app" \
  https://encaixe-api.onrender.com/api/pilha/
# Esperado: Access-Control-Allow-Origin: https://encaixe.vercel.app
```

## CORS já configurado

`django-cors-headers` está em `requirements.txt` e em `INSTALLED_APPS`. O `settings.py` já lê `CORS_ALLOWED_ORIGINS` de variável de ambiente com fallback para `http://localhost:3000`. Basta setar a variável no Render.
