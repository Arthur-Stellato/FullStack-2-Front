# FullStack-2-Front

Front-end do Projeto 2 (Full Stack): controle financeiro pessoal. Consome a API do repositório
[FullStack-2-Back](https://github.com/Arthur-Stellato/FullStack-2-Back).

O aplicativo está na pasta `FrontFinac/`.

## Tecnologias

React 19, Vite, React Router, Context API. O estilo é CSS puro, sem biblioteca de interface.

## Como rodar

Pré-requisitos: Node.js 20 ou superior e a API do back-end rodando (veja o README do repositório do back).

1. Entrar na pasta do aplicativo e instalar as dependências:

   ```bash
   cd FrontFinac
   npm install
   ```

2. Criar o arquivo `FrontFinac/.env` a partir do exemplo (`cp .env.example .env` no Linux/macOS,
   `copy .env.example .env` no Windows) com o endereço da API:

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

   O `.env` não vai para o Git; apenas o `.env.example`.

3. Subir o front em http://localhost:5173:

   ```bash
   npm run dev
   ```

O back precisa estar com `FRONT_URL=http://localhost:5173` no `.env` dele (é o padrão). Se a porta do Vite mudar, o
`FRONT_URL` do back também precisa mudar, senão o CORS bloqueia as requisições.

Outros comandos: `npm run build` (gera a versão de produção), `npm run preview` (serve essa versão) e `npm run lint`.

### Entrar na aplicação

Com o back rodando e o seed executado (`npm run seed` no back), use um usuário de demonstração:

| E-mail | Senha |
|---|---|
| `ana@demo.com` | `demo12345` |
| `bruno@demo.com` | `demo12345` |

Ou crie uma conta em `/cadastro` (nome, e-mail, CPF e senha com 8 a 72 caracteres, com letras e números).

## Telas

| Rota | Tela |
|---|---|
| `/login`, `/cadastro` | Entrar e criar conta |
| `/` | Dashboard: resumo do mês (entradas, saídas, saldo) e saídas por categoria |
| `/lancamentos` | Lançamentos, com filtros, paginação e totais |
| `/fontes-destinos` | Contas, rendas e cartões de crédito |
| `/categorias` | Categorias de entrada e de saída |
| `/relatorios` | Relatórios por categoria e por fonte/destino |
| `/faturas` | Faturas dos cartões de crédito |

Todas as telas, exceto login e cadastro, exigem usuário autenticado.

## Estrutura

```
FrontFinac/src/
  main.jsx              ponto de entrada (BrowserRouter e AuthProvider)
  App.jsx               todas as rotas
  index.css             estilo de todo o aplicativo
  components/           telas e componentes (Login, Cadastro, Dashboard, Layout, RotaProtegida e uma pasta por fatia)
  contexts/             AuthContext (usuário logado, token, login, cadastrar, logout)
  services/             api.js (único ponto de acesso à API), formatadores.js e um arquivo por fatia da API
```

## Decisões do grupo

- **Autenticação:** o token JWT devolvido no login fica no `localStorage` (chave `token`) e sobrevive ao recarregar a
  página. Depois de um recarregamento, o usuário é recuperado pela rota `GET /auth/me`.
- **Único ponto de acesso à API:** `services/api.js`. Nenhuma tela chama `fetch` diretamente. Ele envia o
  `Authorization: Bearer <token>` sozinho e, se a API responder 401 com um token guardado, apaga o token e leva o
  usuário para `/login`. Erros da API são lançados como `{ status, erro, campos }`, e os erros de campo aparecem junto
  ao campo do formulário.
- **Rotas protegidas:** `RotaProtegida` redireciona para `/login` quando não há usuário logado.
- **Telas que consomem a API** tratam os estados de carregamento, lista vazia e erro.
- **Formatação:** valores em reais e datas no formato brasileiro (`services/formatadores.js`). O envio para a API
  continua com número e data no formato `AAAA-MM-DD`.
- **Estilo:** CSS puro em um único arquivo, por seletor de elemento, para que todas as telas tenham o mesmo visual sem
  classes no JSX.