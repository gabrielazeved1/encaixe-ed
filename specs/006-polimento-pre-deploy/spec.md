# Feature Specification: Polimento Pré-Deploy

**Feature Branch**: `006-polimento-pre-deploy`

**Created**: 2026-10-11

**Status**: Draft

**Input**: Ajustes finais de conteúdo, branding e configuração antes do deploy em produção (Vercel + Render).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Repositório sem artefatos de tooling (Priority: P1)

Um colaborador que clona o repositório não encontra arquivos de configuração de ferramentas internas (Spec Kit, Claude Code) rastreados pelo Git.

**Why this priority**: Artefatos de tooling no repositório público poluem o histórico e expõem fluxo de trabalho interno desnecessariamente. Corrigir antes do deploy garante que o primeiro snapshot público já esteja limpo.

**Independent Test**: Pode ser testado com `git status` e `git ls-files` em um clone limpo, verificando que `.specify/` e `.claude/` não aparecem como arquivos rastreados.

**Acceptance Scenarios**:

1. **Given** o repositório clonado, **When** o colaborador lista todos os arquivos rastreados, **Then** nenhum arquivo dentro de `.specify/` ou `.claude/` aparece na listagem.
2. **Given** o `.gitignore` atualizado, **When** um novo arquivo é criado em `.specify/` ou `.claude/`, **Then** o `git status` não exibe esse arquivo como não rastreado.

---

### User Story 2 - README claro e útil para novos visitantes (Priority: P1)

Um desenvolvedor que chega ao repositório pelo GitHub entende imediatamente o que é o projeto, como rodá-lo localmente e onde acessar a versão em produção.

**Why this priority**: O README é a primeira impressão do projeto. Um README incompleto de 11 linhas não comunica o valor nem permite que outra pessoa reproduza o ambiente.

**Independent Test**: Pode ser testado pedindo a alguém sem contexto que siga apenas o README e confirme que o projeto sobe localmente sem perguntas adicionais.

**Acceptance Scenarios**:

1. **Given** o README atualizado, **When** o visitante lê o documento, **Then** ele encontra: descrição do projeto, pré-requisitos, instruções de setup (backend e frontend), stack resumida, estrutura de pastas e link para o site em produção.
2. **Given** instruções de setup, **When** o desenvolvedor as segue passo a passo, **Then** o backend Django e o frontend Next.js sobem sem erros.
3. **Given** o README, **When** o visitante procura onde ver o projeto ao vivo, **Then** encontra o link para o deploy na Vercel.

---

### User Story 3 - Imagem OG / capa do projeto (Priority: P2)

Quando alguém compartilha o link do site em redes sociais ou o link do repositório no GitHub, uma imagem de capa atraente e representativa do Encaixe é exibida.

**Why this priority**: Eleva a percepção do projeto em compartilhamentos e no preview do GitHub sem impacto funcional no produto.

**Independent Test**: Pode ser testado compartilhando o URL em um serviço de preview de Open Graph e verificando que a imagem correta aparece.

**Acceptance Scenarios**:

1. **Given** a imagem OG criada e configurada nos meta tags do Next.js, **When** o link do site é compartilhado, **Then** a preview exibe o nome "Encaixe" e uma representação visual do projeto.
2. **Given** a imagem OG, **When** visualizada isoladamente, **Then** é legível em tamanhos de thumbnail (600×315 e variantes).

---

### User Story 4 - Texto removido da página Sobre (Priority: P2)

O visitante que lê a seção "Origem" da página `/sobre` não encontra mais a frase que está sendo removida.

**Why this priority**: Refinamento de conteúdo solicitado explicitamente. Não bloqueia funcionalidade, mas deve estar pronto antes do deploy.

**Independent Test**: Pode ser testado navegando para `/sobre` e confirmando que a frase não aparece na página renderizada.

**Acceptance Scenarios**:

1. **Given** a página `/sobre` atualizada, **When** o visitante lê a seção "Origem", **Then** a frase "A leitura foi o gatilho — cada capítulo gerou um projeto, cada projeto gerou uma conexão com alguma disciplina da engenharia." não está presente.
2. **Given** a remoção, **When** o visitante lê o parágrafo remanescente da seção "Origem", **Then** o texto ainda faz sentido e flui naturalmente.

---

### User Story 5 - Perguntas contextuais ao lado dos projetos na home (Priority: P2)

O visitante que chega na home entende imediatamente, ao ver a lista/grade de projetos na seção superior, que cada projeto responde a uma pergunta real de engenharia.

**Why this priority**: Aumenta o impacto educacional da primeira impressão. As perguntas contextualizam os projetos para o estudante antes de ele explorar qualquer um.

**Independent Test**: Pode ser testado abrindo a home e confirmando que cada projeto exibido na seção superior tem uma pergunta associada visível sem scroll.

**Acceptance Scenarios**:

1. **Given** a home atualizada, **When** o visitante carrega a página, **Then** cada projeto na seção superior exibe sua pergunta contextual associada ao lado ou abaixo do nome do projeto.
2. **Given** as perguntas em `content/projetos.ts`, **When** as perguntas são exibidas na home, **Then** são as mesmas perguntas já definidas no arquivo de conteúdo (sem duplicar dados).
3. **Given** a seção superior na home, **When** visualizada em mobile, **Then** as perguntas permanecem legíveis e o layout não quebra.

---

### User Story 6 - Site em produção acessível (Priority: P1)

O visitante acessa o site Encaixe via URL pública na Vercel e todas as funcionalidades dos 7 mini-projetos funcionam corretamente com o backend hospedado no Render.

**Why this priority**: É o objetivo final desta feature — o produto chega ao ar.

**Independent Test**: Pode ser testado acessando o URL de produção e interagindo com pelo menos um mini-projeto end-to-end.

**Acceptance Scenarios**:

1. **Given** o deploy concluído, **When** o visitante acessa o URL de produção, **Then** a home carrega em menos de 3 segundos em conexão padrão.
2. **Given** o backend no Render, **When** o visitante interage com um mini-projeto, **Then** a resposta da API chega e a visualização é atualizada sem erros de CORS ou rede.
3. **Given** o ambiente de produção, **When** o frontend chama a API, **Then** a variável de ambiente `NEXT_PUBLIC_API_URL` aponta para o URL do Render e não para `localhost`.

---

### Edge Cases

- O que acontece se `.specify/` já tiver arquivos rastreados antes do `.gitignore` ser atualizado? (Será necessário `git rm --cached`)
- A imagem OG precisa funcionar tanto para o site quanto para o preview do repositório no GitHub?
- Alguma das perguntas em `content/projetos.ts` está em branco ou é um placeholder?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O `.gitignore` raiz DEVE incluir entradas para `.specify/` e `.claude/`, impedindo que qualquer arquivo desses diretórios seja rastreado.
- **FR-002**: Arquivos de `.specify/` e `.claude/` já rastreados DEVEM ser removidos do índice Git (`git rm --cached`) se existirem.
- **FR-003**: O `README.md` DEVE conter: descrição do projeto, pré-requisitos (Python 3.14+, Node 18+), instruções de setup para backend e frontend, stack resumida em tabela, estrutura de pastas e link para o deploy em produção.
- **FR-004**: O site DEVE ter uma imagem Open Graph configurada nos meta tags (`og:image`), exibida ao compartilhar o URL.
- **FR-005**: A página `/sobre`, seção "Origem", NÃO DEVE conter a frase "A leitura foi o gatilho — cada capítulo gerou um projeto, cada projeto gerou uma conexão com alguma disciplina da engenharia."
- **FR-006**: A seção superior da home DEVE exibir, para cada projeto listado, a pergunta contextual correspondente reutilizando os dados de `content/projetos.ts`.
- **FR-007**: O frontend DEVE ser deployado na Vercel com a variável de ambiente `NEXT_PUBLIC_API_URL` apontando para o backend no Render.
- **FR-008**: O backend DEVE ser deployado no Render com CORS configurado para aceitar requisições do domínio Vercel de produção.
- **FR-009**: O frontend NÃO DEVE realizar chamadas para `localhost` em produção.

### Key Entities

- **Imagem OG**: arquivo estático (PNG ou JPG, 1200×630px recomendado) com nome e identidade visual do Encaixe; configurado no `layout.tsx` ou `page.tsx` raiz do Next.js via `metadata.openGraph`.
- **Pergunta contextual**: campo já existente em cada entrada de `content/projetos.ts`, associado a um dos 7 projetos; deve ser lido e exibido na home sem duplicação de dados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhum arquivo de `.specify/` ou `.claude/` aparece em `git ls-files` após as alterações.
- **SC-002**: Um desenvolvedor sem contexto prévio consegue subir o projeto localmente seguindo apenas o README, sem abrir nenhum outro arquivo de documentação.
- **SC-003**: O link do site compartilhado em qualquer ferramenta de preview de Open Graph exibe a imagem do Encaixe (não o fallback padrão do navegador).
- **SC-004**: A frase removida não é encontrada em nenhuma saída de `grep` no diretório `frontend/`.
- **SC-005**: Cada um dos 7 projetos na seção superior da home exibe sua pergunta contextual sem necessidade de interação do usuário.
- **SC-006**: Todas as chamadas de API na versão de produção retornam HTTP 200 sem erros de CORS (verificável via DevTools).
- **SC-007**: O site em produção carrega a home em menos de 3 segundos em conexão padrão (medido com Lighthouse ou WebPageTest).

## Assumptions

- As perguntas contextuais já existem como campo em `content/projetos.ts`; se não existirem, serão adicionadas nesta feature.
- O domínio de produção na Vercel será o subdomínio padrão gerado (`*.vercel.app`) na ausência de domínio customizado.
- O backend no Render usará o plano gratuito (pode haver cold start de até 30s); isso é aceitável para v1.
- A imagem OG será criada como arquivo estático em `frontend/public/`, não gerada dinamicamente.
- A cor da engrenagem mencionada pelo usuário ("talvez trocar de cor") é uma decisão de design a ser avaliada durante a implementação; se a troca for feita, seguirá a paleta já existente no Tailwind config do projeto.
- Não há domínio customizado planejado para v1; o link no README apontará para o subdomínio Vercel.
