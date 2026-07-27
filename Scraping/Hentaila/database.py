import os
import asyncio
import json
import libsql_client
from dotenv import load_dotenv

load_dotenv()

TURSO_URL = os.getenv("TURSO_DATABASE_URL", "file:hentaila_local.db")
TURSO_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "")

def get_client():
    if "file:" in TURSO_URL:
        return libsql_client.create_client(TURSO_URL)
    else:
        return libsql_client.create_client(TURSO_URL, auth_token=TURSO_TOKEN)

async def init_db():
    async with get_client() as client:
        # We only need one table: content
        await client.execute("""
            CREATE TABLE IF NOT EXISTS content (
                slug TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                title TEXT NOT NULL,
                poster TEXT,
                total_episodes INTEGER DEFAULT 1,
                details TEXT NOT NULL
            )
        """)

async def save_anime(anime):
    """Guarda o actualiza un anime en Turso usando la arquitectura JSON unificada"""
    async with get_client() as client:
        # Convert the entire scraped dictionary into a JSON string
        details_json = json.dumps(anime)
        total_eps = len(anime.get("capitulos", []))
        
        await client.execute(
            """
            INSERT INTO content (slug, content_type, title, poster, total_episodes, details)
            VALUES (?, 'adult_anime', ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET
                title=excluded.title,
                poster=excluded.poster,
                total_episodes=excluded.total_episodes,
                details=excluded.details
            """,
            (
                anime["slug"],
                anime.get("titulo", ""),
                anime.get("portada", ""),
                total_eps,
                details_json
            )
        )

async def count_animes():
    async with get_client() as client:
        rs = await client.execute("SELECT COUNT(*) FROM content WHERE content_type = 'adult_anime'")
        return rs.rows[0][0]

async def get_all_animes_basic():
    async with get_client() as client:
        rs = await client.execute("""
            SELECT title, slug, poster, total_episodes 
            FROM content 
            WHERE content_type = 'adult_anime'
        """)
        return [
            {
                "titulo": row[0],
                "slug": row[1],
                "portada": row[2],
                "capitulos_total": row[3]
            }
            for row in rs.rows
        ]

async def get_anime_full(slug: str):
    async with get_client() as client:
        rs = await client.execute("SELECT details FROM content WHERE slug = ? AND content_type = 'adult_anime'", (slug,))
        if not rs.rows:
            return None
        
        return json.loads(rs.rows[0][0])

async def get_anime_chapters_numbers(slug: str):
    async with get_client() as client:
        rs = await client.execute("SELECT details FROM content WHERE slug = ? AND content_type = 'adult_anime'", (slug,))
        if not rs.rows:
            return []
            
        anime_data = json.loads(rs.rows[0][0])
        return [cap["numero"] for cap in anime_data.get("capitulos", [])]
