# InsideHub Frontend

React + Vite + TypeScript + Tailwind CSS v4 client for the InsideHub FastAPI backend (`../insidehubv2`).
Design language: **Field Journal**, a travel-journal look with paper textures, postcard cards,
perforated category stamps, postmark dates and a boarding-pass sign-in.

## Run it

```bash
# 1. backend (from ../insidehubv2)
docker compose up        # or: uvicorn app.main:app --port 8000

# 2. frontend
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api/v1
npm install
npm run dev              # http://localhost:3000 (already allowed by backend CORS)
```

`npm run build` type-checks and builds to `dist/`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Landing: hero collage, category drawers, latest entries |
| `/explore`, `/c/:slug` | Feed (all / per category) with search and "load more" |
| `/p/:id` | Reading view with gallery, edit/delete for the owner |
| `/new`, `/p/:id/edit` | Editor (login required): category stamps, photo upload or links |
| `/me` | Your passport + your entries (login required) |
| `/u/:id` | Public author page |
| `/login`, `/register` | Boarding-pass auth |

## Structure

```
src/
  api/          axios client (bearer token, 401 -> logout) + auth/posts/users calls
  context/      AuthContext (JWT in localStorage, expiry timer, current user via /users/me)
  hooks/        TanStack Query hooks
  lib/          category metadata (mirrors backend app/posts/constants.py), formatters
  components/   layout (Masthead, Footer, BoardingPass, PassportCard), ui, posts
  pages/
```

## Backend endpoints used

- `POST /users/register`, `POST /users/login`, `GET|PATCH /users/me`, `GET /users/{id}/profile`
- `GET /posts?skip&limit&category&author_id&search` (public), `GET /posts/{id}` (public)
- `POST /posts`, `PATCH /posts/{id}`, `DELETE /posts/{id}` (owner only)
- `GET /posts/categories`, `POST /posts/images` (raw image body, `Content-Type: image/*`, max 5 MB)
- Uploaded files are served from `/media/...`
