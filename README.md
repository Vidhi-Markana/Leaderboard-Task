# Leaderboard Website

A full-stack web application for managing a real-time leaderboard, where users can claim random points and compete for the top spot. Built with Node.js, Express, MongoDB (backend), and React (frontend).

---

## Features

- **Leaderboard**: Displays users ranked by points, with animated podium for top 3.
- **User Management**: Add new users (unique names enforced).
- **Claim Points**: Select a user and claim random points (1-10) for them.
- **Claim History**: Paginated, real-time log of all point claims.
- **Persistent Storage**: All data stored in MongoDB.
- **Responsive UI**: Modern, animated React interface.

---

## Project Structure

```
LeaderboardTask/
  backend/    # Node.js + Express + MongoDB API
  frontend/   # React single-page app
```

---

## Backend (Node.js + Express + MongoDB)

- **Location**: `backend/`
- **Main file**: `index.js`
- **Models**: `User`, `ClaimHistory`
- **API Endpoints**:
  - `GET /users` — List all users, sorted by points
  - `POST /users` — Add a new user (unique name)
  - `POST /users/:id/claim` — Claim random points for a user
  - `GET /history` — Get claim history (most recent first)
- **Seeding**: Seeds 10 default users if DB is empty
- **Environment**: Requires `MONGODB_URI` in `.env`

### Setup & Run

1. Copy `.env.example` to `.env` and set your MongoDB URI
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start server:
   ```bash
   npm start
   ```
   Runs on [http://localhost:4000](http://localhost:4000)

---

## Frontend (React)

- **Location**: `frontend/`
- **Main file**: `src/App.js`
- **Components**: Leaderboard, Podium, Claim History, Pagination
- **API URL**: Set in `src/App.js` (default: `http://localhost:4000`)

### Setup & Run

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start app:
   ```bash
   npm start
   ```
   Runs on [http://localhost:3000](http://localhost:3000)

---

## Deployment

- **Backend**: Deploy `backend/` to Node.js hosts (Render, Railway, Heroku, etc.)
  - Set `MONGODB_URI` in your host's environment variables
- **Frontend**: Deploy `frontend/` to Netlify, Vercel, etc.
  - Set API URL in `src/App.js` to your deployed backend URL

---

## Data Models

### User
- `name` (String, required, unique)
- `points` (Number, default: 0)
- `createdAt` (Date)

### ClaimHistory
- `userId` (ObjectId, ref: User)
- `name` (String)
- `points` (Number)
- `timestamp` (Date)

---

## Author
Crafted with ❤️ by Vidhi Markana 