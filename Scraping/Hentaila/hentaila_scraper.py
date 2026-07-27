#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hentaila_scraper.py
Motor principal de scraping.
"""

import argparse
import asyncio
import json
import random
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

# ============================================================
# CONFIGURACIÓN GENERAL
# ============================================================
BASE_URL = "https://hentaila.com"
CATALOG_URL = f"{BASE_URL}/catalogo"
OUTPUT_PATH = Path("./download/hentaila_data.json")
PROGRESS_PATH = Path("./download/hentaila_progress.json")

DEFAULT_CONCURRENCY = 10
DELAY_MIN = 0.8
DELAY_MAX = 2.5
REQUEST_TIMEOUT = 30
MAX_RETRIES = 3

# ============================================================
# USER-AGENTS
# ============================================================
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

def random_headers(referer: str = None) -> dict:
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin" if referer else "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
        "DNT": "1",
    }
    if referer:
        headers["Referer"] = referer
    return headers

async def random_delay():
    await asyncio.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

# ============================================================
# CLIENTE HTTP
# ============================================================
concurrency_global = DEFAULT_CONCURRENCY

class HttpClient:
    def __init__(self, concurrency: int = DEFAULT_CONCURRENCY):
        self.semaphore = asyncio.Semaphore(concurrency)
        self.session = None
        self.concurrency = concurrency

    async def __aenter__(self):
        connector = aiohttp.TCPConnector(
            limit=self.concurrency,
            limit_per_host=self.concurrency,
            ssl=False,
            force_close=False,
        )
        timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
        return self

    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()

    async def get(self, url: str, referer: str = None) -> str | None:
        async with self.semaphore:
            await random_delay()
            for intento in range(1, MAX_RETRIES + 1):
                try:
                    async with self.session.get(
                        url, headers=random_headers(referer), allow_redirects=True
                    ) as resp:
                        if resp.status == 200:
                            return await resp.text()
                        elif resp.status in (429, 503):
                            print(f"[HTTP {resp.status}] Reintentando {url}...")
                            wait = 2 ** intento + random.uniform(0, 2)
                            await asyncio.sleep(wait)
                        else:
                            print(f"[HTTP ERROR] {url} devolvió status {resp.status}")
                            return None
                except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                    print(f"[NETWORK ERROR] {url} falló: {e}")
                    await asyncio.sleep(2 ** intento)
            return None

# ============================================================
# HELPERS & SCRAPING LOGIC
# ============================================================
def first_text(soup, selectors: list[str], default: str = "") -> str:
    for sel in selectors:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)
    return default

async def scrape_catalog_page(client: HttpClient, page_url: str) -> list[dict]:
    html = await client.get(page_url, referer=BASE_URL)
    if not html: return []
    soup = BeautifulSoup(html, "html.parser")
    animes, seen_slugs = [], set()

    for article in soup.select("article"):
        link = article.find("a", href=re.compile(r"^/media/[\w\-]+/?$"))
        if not link: continue
        href = link.get("href", "")
        m = re.match(r"^/media/([\w\-]+)/?$", href)
        if not m: continue
        slug = m.group(1)
        if slug in seen_slugs: continue
        seen_slugs.add(slug)

        h3 = article.find("h3")
        titulo = h3.get_text(strip=True) if h3 else slug.replace("-", " ").title()
        
        img = article.find("img", alt=re.compile(r"Portada", re.I))
        if not img: img = article.find("img")
        portada = img.get("src") or img.get("data-src") or "" if img else ""
        if portada and not portada.startswith("http"):
            portada = urljoin(BASE_URL, portada)

        p = article.find("p")
        sinopsis_corta = p.get_text(strip=True) if p else ""

        animes.append({
            "titulo": titulo, "slug": slug,
            "url": urljoin(BASE_URL, href),
            "portada": portada, "sinopsis_corta": sinopsis_corta,
        })
    return animes

async def scrape_all_catalog(client: HttpClient) -> list[dict]:
    todos_animes, seen_slugs = [], set()
    pagina = 1
    while True:
        page_url = f"{CATALOG_URL}?page={pagina}"
        animes = await scrape_catalog_page(client, page_url)
        if not animes: break

        nuevos = 0
        for a in animes:
            if a["slug"] not in seen_slugs:
                seen_slugs.add(a["slug"])
                todos_animes.append(a)
                nuevos += 1

        if nuevos == 0 or pagina > 1000: break
        pagina += 1
    return todos_animes

async def scrape_anime_detail(client: HttpClient, anime: dict) -> dict:
    url = anime["url"]
    html = await client.get(url, referer=BASE_URL)
    if not html:
        anime.update({"categorias": [], "descripcion": "", "estado": "", "tipo": "", "temporada": "", "vistas": "", "backdrop": "", "capitulos": []})
        return anime

    soup = BeautifulSoup(html, "html.parser")
    titulo = first_text(soup, ["h1.text-lead", "h1"])
    if titulo: anime["titulo"] = titulo

    poster_img = soup.find("img", alt=re.compile(r"Poster$", re.I))
    if poster_img:
        src = poster_img.get("src", "")
        if src and not src.startswith("http"): src = urljoin(BASE_URL, src)
        if src: anime["portada"] = src

    backdrop_img = soup.find("img", alt=re.compile(r"Backdrop$", re.I))
    if backdrop_img:
        bd = backdrop_img.get("src", "")
        if bd and not bd.startswith("http"): bd = urljoin(BASE_URL, bd)
        anime["backdrop"] = bd

    entry = soup.select_one("div.entry")
    anime["descripcion"] = (entry.find("p").get_text(strip=True) if entry and entry.find("p") else entry.get_text(strip=True)) if entry else ""

    anime["categorias"] = [a.get_text(strip=True) for a in soup.select('a[href^="/catalogo?genre="]') if a.get_text(strip=True)]

    meta = []
    meta_div = soup.select_one("div.flex.flex-wrap.items-center.gap-2.text-sm")
    if meta_div:
        meta = [span.get_text(strip=True) for span in meta_div.find_all("span") if span.get_text(strip=True) != "•"]

    anime["tipo"] = meta[0] if len(meta) >= 1 else ""
    anime["vistas"] = meta[1] if len(meta) >= 2 else ""
    anime["temporada"] = meta[2] if len(meta) >= 3 else ""
    anime["estado"] = meta[3] if len(meta) >= 4 else ""

    capitulos = []
    pattern = re.compile(rf"^/media/{re.escape(anime['slug'])}/(\d+)/?$")
    for a in soup.find_all("a", href=pattern):
        href = a.get("href", "")
        full_url = urljoin(BASE_URL, href)
        texto = re.sub(r"^Ver\s+", "", a.get_text(strip=True))
        m = pattern.match(href)
        numero = int(m.group(1)) if m else len(capitulos) + 1
        capitulos.append({"numero": numero, "titulo": texto, "url": full_url, "proveedores": []})

    seen = set()
    unicos = []
    for c in capitulos:
        if c["url"] not in seen:
            seen.add(c["url"])
            unicos.append(c)
    unicos.sort(key=lambda x: x["numero"])
    anime["capitulos"] = unicos
    return anime

EMBEDS_PATTERN = re.compile(r'embeds:\{[^[]*\[\s*((?:\{server:"[^"]+",url:"[^"]+"\s*\}\s*,?\s*)+)\s*\]', re.DOTALL)
DOWNLOADS_PATTERN = re.compile(r'downloads:\{[^[]*\[\s*((?:\{server:"[^"]+",url:"[^"]+"\s*\}\s*,?\s*)+)\s*\]', re.DOTALL)
SERVER_ITEM_PATTERN = re.compile(r'\{server:"([^"]+)",url:"([^"]+)"\}')

async def scrape_episode_providers(client: HttpClient, capitulo: dict) -> dict:
    url = capitulo["url"]
    html = await client.get(url, referer=BASE_URL)
    if not html: return {"embeds": [], "downloads": []}

    embeds, downloads = [], []
    m_emb = EMBEDS_PATTERN.search(html)
    if m_emb:
        for name, url_v in SERVER_ITEM_PATTERN.findall(m_emb.group(1)):
            embeds.append({"nombre": name, "url": url_v, "dominio": urlparse(url_v).netloc.replace("www.", "")})

    m_dwn = DOWNLOADS_PATTERN.search(html)
    if m_dwn:
        for name, url_v in SERVER_ITEM_PATTERN.findall(m_dwn.group(1)):
            downloads.append({"nombre": name, "url": url_v, "dominio": urlparse(url_v).netloc.replace("www.", "")})
            
    return {"embeds": embeds, "downloads": downloads}

async def process_anime(client: HttpClient, anime: dict, idx: int, total: int) -> dict:
    anime = await scrape_anime_detail(client, anime)
    for cap in anime.get("capitulos", []):
        provs = await scrape_episode_providers(client, cap)
        cap["proveedores"] = provs["embeds"]
        cap["descargas"] = provs["downloads"]
    return anime

# Para evitar que se corra el main si solo importamos las funciones
if __name__ == "__main__":
    print("Por favor, ejecuta la API a través de api.py para utilizar la versión con FastAPI y auto-actualización.")
