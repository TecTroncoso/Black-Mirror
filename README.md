# Black Mirror OS

Black Mirror is a futuristic, TV-inspired full-stack application featuring a sleek, dark-themed OS interface. It provides interactive UI modules, an authentication system, content grid, and a system terminal log, all beautifully styled with modern web technologies.

## ✨ Features

- **Futuristic UI**: A premium dark-mode interface built with **Tailwind CSS v4**, featuring glassmorphism, dynamic animations, and flowing neon accents.
- **Secure Authentication**: Full login and registration system.
- **Universal Content Architecture**: A highly scalable NoSQL-like JSON architecture hosted on a Turso Edge Database, capable of storing Movies, Series, Anime, and Adult Anime in a single table with infinite flexibility.
- **Automated Python Scrapers**: Includes an auto-updating scraper orchestrator (e.g., Hentaila) that periodically populates the Turso Cloud Database with fresh content.
- **Cloudflare Workers API**: A blazing fast Edge API built with Hono.js.

## 🛠️ Tech Stack

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS v4, Lucide React
- **Backend (API):** Hono.js (Cloudflare Workers)
- **Database:** Turso (SQLite on the Edge) via `@libsql/client`
- **Scraping:** Python 3, FastAPI, httpx, BeautifulSoup4

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+) and Python 3.9+

### 1. Setup the Edge API (Cloudflare Worker)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Add your Turso credentials. Create a `.dev.vars` file inside the `server/` directory:
```env
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-token
```
Start the local Cloudflare Worker emulator:
```bash
npm run dev
```
The API will run on `http://localhost:8787`.

### 2. Setup the Scraper (Python)
Navigate to the scraper directory:
```bash
cd Scraping/Hentaila
pip install -r requirements.txt
```
Copy your Turso credentials. Create a `.env` file inside the `Scraping/Hentaila/` directory:
```env
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-token
```
Start the Auto-Scraper:
```bash
python api.py
```

### 3. Setup the Frontend (Development)
Open a new terminal at the root of the project:
```bash
npm install
```
If you want to connect to your production API instead of the local emulator, create a `.env` file in the root directory:
```env
VITE_API_URL=https://your-cloudflare-worker-url.workers.dev
```
Run the frontend:
```bash
npm run dev
```

## 📂 Project Structure

- `src/`: React frontend (App, views, and components).
- `server/`: Hono.js Cloudflare Worker API.
- `Scraping/`: Python scrapers and database updaters.
