# Black Mirror OS 📺

Black Mirror is a futuristic, TV-inspired full-stack application featuring a sleek, dark-themed OS interface. It provides a modular streaming platform, an authentication system, dynamic content grids, and a scalable architecture designed to handle thousands of media entries effortlessly.

![Black Mirror Interface](https://via.placeholder.com/1200x600/000000/3b82f6?text=Black+Mirror+OS)

## ✨ Core Features

- **Futuristic UI/UX**: A premium dark-mode interface built with **Tailwind CSS v4**, featuring glassmorphism, dynamic animations, flowing neon accents, and a custom cinematic scrollbar.
- **Universal Content Architecture**: A highly scalable NoSQL-like JSON architecture hosted on a **Turso Edge Database**. It stores Movies, Series, Anime, and Adult Anime in a single unified table, using JSON payloads for infinite schema flexibility.
- **Automated Python Scrapers**: Includes a self-hosted, auto-updating scraper orchestrator (e.g., Hentaila). Built with Python `asyncio` and `httpx`, it periodically scrapes, processes, and syncs fresh content directly to the Turso Cloud Database.
- **Edge API**: A blazing fast REST API built with **Hono.js** and deployed on **Cloudflare Workers**.
- **Content Filtering**: Built-in settings module to seamlessly toggle specific content categories (e.g., Adult Content) dynamically on the client side.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 (TypeScript) + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Architecture**: Context-free prop drilling for lightweight state, local storage persistence for user preferences.

### Backend (Edge API)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Turso (SQLite on the Edge) via `@libsql/client`

### Scraping Engine (Orchestrator)
- **Language**: Python 3.9+
- **Framework**: FastAPI (for lifecycle management)
- **Libraries**: `httpx` (async HTTP), `BeautifulSoup4` (HTML parsing)

---

## 📂 Project Structure

```text
BlackMirror/
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components (NavBar, TopBar, ContentCard)
│   ├── views/              # Main application views (Home, ContentGrid, Auth, Settings)
│   ├── services/           # API and local storage communication
│   ├── index.css           # Global Tailwind and custom cinematic styles
│   └── App.tsx             # Main router and layout wrapper
├── server/                 # Cloudflare Worker API (Hono)
│   ├── index.js            # API endpoints and Turso DB connection
│   └── wrangler.toml       # Cloudflare deployment configuration
└── Scraping/               # Python Scrapers
    └── Hentaila/           # Adult Anime Auto-Scraper
        ├── api.py          # FastAPI lifecycle and background updater
        ├── database.py     # Turso DB connection and query formatting
        └── hentaila_scraper.py # Web scraping logic (BeautifulSoup4)
```

---

## 🚀 Local Development Setup

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
*The API will run locally on `http://localhost:8787`.*

### 2. Setup the Content Scrapers (Python)
Navigate to the specific scraper directory you want to run:
```bash
cd Scraping/Hentaila
pip install -r requirements.txt
```
Copy your Turso credentials. Create a `.env` file inside the `Scraping/Hentaila/` directory:
```env
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-token
```
Start the Auto-Scraper (this will sync the Turso DB with the latest content):
```bash
python api.py
```

### 3. Setup the Frontend (Vite)
Open a new terminal at the root of the project:
```bash
npm install
```
If you want to connect to your production API instead of the local emulator, create a `.env` file in the root directory:
```env
VITE_API_URL=https://your-cloudflare-worker-url.workers.dev
```
Run the frontend development server:
```bash
npm run dev
```
*The UI will be accessible at `http://localhost:5173`.*

---

## 📦 Database Schema Design

This project avoids fragmented tables by using a **Universal Content Architecture**. All content resides in a single `content` table:

| Column | Type | Description |
|--------|------|-------------|
| `slug` | `TEXT` | Primary key, unique identifier for the media. |
| `content_type` | `TEXT` | Categorizes the media (`movie`, `series`, `anime`, `adult_anime`). |
| `title` | `TEXT` | Display title. |
| `poster` | `TEXT` | URL to the thumbnail/poster image. |
| `total_episodes` | `INTEGER` | Number of episodes (defaults to 1 for movies). |
| `details` | `TEXT (JSON)` | Flexible schema containing specific data (servers, actors, ratings). |

This allows for blazing fast global searches (`SELECT * FROM content WHERE title LIKE ?`) without complex SQL `JOIN` operations.

---

## 🔒 Security & Best Practices

- **Environment Variables**: All `.env` and `.dev.vars` files are globally ignored by Git. Never commit Turso or Cloudflare credentials.
- **Edge Deployment**: The backend is completely serverless, scaling automatically via Cloudflare's Edge network, minimizing latency globally.
- **Graceful Error Handling**: Scrapers run continuously in the background, utilizing try-catch blocks and async concurrency to prevent connection pooling issues or application crashes.
