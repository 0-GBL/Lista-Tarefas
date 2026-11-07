# Organiza — Lista de Tarefas

Aplicação full stack de lista de tarefas, separada em `backend` e `frontend`.

## Tecnologias

- **Backend:** Node.js, Express, MongoDB Atlas (Mongoose), dotenv e CORS.
- **Frontend:** React, Vite e CSS responsivo sem dependências visuais pesadas.

## Funcionalidades

- Criar tarefas com título, descrição, data e horário.
- Visualizar e ordenar tarefas por data e hora.
- Filtrar por status: todas, pendentes e concluídas.
- Alternar rapidamente entre pendente e concluída.
- Editar e excluir tarefas.
- Painel com resumo da agenda e barra de progresso.

## Como executar

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Abra o `.env` e informe a sua string do MongoDB Atlas em `MONGODB_URI`. Por padrão, a API roda em `http://localhost:5000`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abra a URL indicada pelo Vite (normalmente `http://localhost:5173`). O arquivo `.env` do frontend já aponta para a API local; altere `VITE_API_URL` ao publicar o backend.

## Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/tasks` | Lista tarefas, aceita `status=pending|completed` |
| POST | `/api/tasks` | Cria uma tarefa |
| PUT | `/api/tasks/:id` | Atualiza uma tarefa |
| PATCH | `/api/tasks/:id/toggle` | Alterna o status |
| DELETE | `/api/tasks/:id` | Exclui uma tarefa |

