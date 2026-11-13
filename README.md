# Express.js  · Homework 01 · REST API

A REST API for managing users and articles, built with Node.js and Express 5.

## Features

- CRUD operations for users and articles
- In-memory storage using JavaScript `Map`
- Request validation for `name` and `title`
- JSON responses and appropriate HTTP status codes
- Centralized handling of 404 and 500 errors
- Automated tests with Vitest and Supertest
- Interactive browser playground (local live API + GitHub Pages simulation)

## Tech Stack

- Node.js (ES Modules)
- Express 5
- Vitest and Supertest

## Getting Started

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The API is available at `http://localhost:3000`.

For development with automatic restarts:

```bash
npm run dev
```

## Interactive Demo

- **Live local API:** run `npm start` and open `http://localhost:3000/demo/`. All actions call the real Express routes.
- **[GitHub Pages preview](https://andrii-dolzhenko.github.io/express-homework-01-rest-api/):** the static playground simulates API responses in browser memory. GitHub Pages does **not** host the Node.js backend.
- The preview resets when you reload the page; the real API also uses in-memory storage that resets on server restart.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Health-check-style root response |
| GET | `/users` | List users |
| GET | `/users/:userId` | Get a user by ID |
| POST | `/users` | Create a user |
| PUT | `/users/:userId` | Update a user |
| DELETE | `/users/:userId` | Delete a user |
| GET | `/articles` | List articles |
| GET | `/articles/:articleId` | Get an article by ID |
| POST | `/articles` | Create an article |
| PUT | `/articles/:articleId` | Update an article |
| DELETE | `/articles/:articleId` | Delete an article |

POST and PUT requests expect JSON with a non-empty `name` for users or `title` for articles.

Example:

```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alex"}'
```

## HTTP Status Codes

- `200` — Successful retrieval or update
- `201` — Resource created
- `204` — Resource deleted (empty response body)
- `400` — Invalid request data
- `404` — Resource or route not found
- `500` — Unexpected server error

Data is stored in memory and resets when the server restarts. No external database is required.

## Testing

```bash
npm test
```

The included test suite covers the root route, CRUD operations, validation, and error handling (23 tests).

## Automation

- GitHub Actions runs the 23 automated tests on pushes and pull requests to `main`.
- A separate Pages workflow publishes the `demo/` directory when configured under **Settings → Pages → Source: GitHub Actions**.

## Project Structure

```text
demo/
├── index.html
├── styles.css
└── app.js

src/
├── __test__/task1.test.js
├── controllers/
│   ├── articles.mjs
│   └── users.mjs
├── data/
│   ├── articles.mjs
│   └── users.mjs
├── routes/
│   ├── articles.mjs
│   └── users.mjs
├── ASSIGNMENT.md
└── server.mjs
```

---

Copyright © 2026 Andrii Dolzhenko.
