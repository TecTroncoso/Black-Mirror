# Black Mirror OS

Black Mirror is a futuristic, TV-inspired full-stack application featuring a sleek, dark-themed OS interface. It provides interactive UI modules, an authentication system, a simulated streaming AI chat, and a system terminal log, all beautifully styled with modern web technologies.

## ✨ Features

- **Futuristic UI**: A premium dark-mode interface built with **Tailwind CSS v4**, featuring glassmorphism, dynamic animations, and flowing neon accents.
- **Secure Authentication**: Full login and registration system backed by an Express API and Turso Edge Database.
- **Simulated AI Assistant**: An interactive chat interface that mocks real-time streaming AI responses.
- **Dynamic Module System**: Toggle different "channels" or personas out of the box (e.g. Cinema, Dev Tools, Sports).
- **System Terminal**: A built-in terminal UI to display system logs and activities.

## 🛠️ Tech Stack

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS v4, Lucide React
- **Backend:** Hono.js (Node Adapter for local dev, 100% Cloudflare Workers compatible)
- **Database:** Turso (SQLite on the Edge) via `@libsql/client`

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+ recommended)

### 1. Setup the Database (Backend)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Add your Turso credentials. Create a `.env` file inside the `server/` directory:
```env
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-token
```
*(If you do not provide a `.env`, the server will automatically create a local `local.db` SQLite file for testing).*

Start the backend server:
```bash
node index.js
```
The API will run on `http://localhost:3000`.

### 2. Setup the Frontend
Open a new terminal at the root of the project:
```bash
npm install
npm run dev
```
The React application will run on `http://localhost:5173` and automatically proxy `/api` requests to your Express backend.

## 📂 Project Structure

- `src/App.tsx`: Main application container, view routing, and state management.
- `src/views/`: Isolated page views (`AuthView`, `HomeView`, `LiveChatView`, etc.).
- `src/services/`: Core logic, including `authService.ts` and `aiService.ts`.
- `server/`: Node.js Express backend and Turso database configuration.
