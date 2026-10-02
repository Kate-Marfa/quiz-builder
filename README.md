# Quiz Builder

A small full-stack application for creating, listing, viewing and deleting quizzes.

- **Backend:** NestJS, TypeScript, SQLite.
- **Frontend:** React, TypeScript, Vite, React Router.
- **Questions:** True/False, short text answer, multiple choice with multiple correct answers.
- Quiz details show the structure and correct answers in read-only mode.

## Project structure

```text
quiz-builder/
├── backend/         # NestJS API
│   ├── src/
│   └── models/
├── frontend/        # React app
│   ├── pages/
│   ├── components/
│   └── services/
└── README.md
```

## Requirements

Node.js **22.13 or newer** and npm. SQLite uses the built-in `node:sqlite` module, so no database server or native package installation is needed. Node 22 may print an experimental SQLite warning.

## Start the backend

```bash
cd backend
npm ci
cp .env.example .env
npm run start:dev
```

The API runs at `http://localhost:3000`.

Backend `.env` settings:

```dotenv
PORT=3000
DATABASE_PATH=./data/quizzes.sqlite
FRONTEND_URL=http://localhost:5173
```

The database directory, SQLite file and table are created automatically on startup. `DATABASE_PATH` is relative to the backend working directory, or can be an absolute path. Quizzes persist across restarts. Local database files and `.env` files are ignored by Git; only `.env.example` is committed.

## Start the frontend

In another terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Frontend `.env` contains `VITE_API_URL=/api`. Vite proxies `/api` to the backend during local development, so the browser uses one origin and does not need a separate CORS request. Restart Vite after changing this value. If you need a direct backend URL, set `VITE_API_URL=http://localhost:3000` and keep the backend running on that port.

## Create a sample quiz

1. Open `/create` and enter a quiz title.
2. Enter a True/False question and select its correct answer.
3. Click **Add question**, select **Short answer**, and enter the question and answer.
4. Add a **Multiple choice** question, enter at least two options, and check each correct answer. At least one must be correct.
5. Click **Create quiz** to open its read-only details.
6. Open `/quizzes` to see its title and question count. Use the trash icon to delete it.

You can also create a sample directly through the API:

```bash
curl -X POST http://localhost:3000/quizzes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Web basics","questions":[{"type":"boolean","text":"HTML is a markup language.","answer":true},{"type":"input","text":"What styles a web page?","answer":"CSS"},{"type":"checkbox","text":"Select web languages.","options":[{"text":"HTML","correct":true},{"text":"CSS","correct":true},{"text":"Photoshop","correct":false}]}]}'
```

## API

| Method | Path           | Result                                              |
| ------ | -------------- | --------------------------------------------------- |
| POST   | `/quizzes`     | `201`: created quiz with `id`, `title`, `questions` |
| GET    | `/quizzes`     | `200`: array of `{ id, title, questionCount }`      |
| GET    | `/quizzes/:id` | `200`: quiz with all questions and answers          |
| DELETE | `/quizzes/:id` | `204`: quiz deleted, empty response                 |

Invalid quiz data returns `400`. An unknown quiz ID returns `404`. A quiz requires a nonblank title and at least one question. Question text, short answers and option text must be nonblank. Checkbox questions require at least two options and at least one correct option. Leading and trailing whitespace is trimmed.

## Checks

Run in **each** directory:

```bash
npm run lint
npm run format:check
npm run build
```

To format files, run `npm run format`. Run the API integration tests in `backend`:

```bash
npm test -- --runInBand
```

The tests use an in-memory database and cover all four endpoints, all question types, validation and missing quizzes.

For a local production build, use `npm run build && npm run start:prod` in `backend` and `npm run build && npm run preview` in `frontend`. Vite preview defaults to port 4173; set `VITE_API_URL=http://localhost:3000` in the production frontend environment or configure the deployed server to proxy `/api` to the backend. Set backend `FRONTEND_URL=http://localhost:4173` when using a direct backend URL. A deployed frontend must serve `index.html` for `/create` and `/quizzes/*` to support React Router links and refreshes.
