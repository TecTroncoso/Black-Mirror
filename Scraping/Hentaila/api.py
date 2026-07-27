import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
import uvicorn

# Importamos el módulo de base de datos que acabamos de armar
from database import (
    init_db, save_anime, count_animes, 
    get_all_animes_basic, get_anime_full, get_anime_chapters_numbers
)

# Importamos las funciones principales del scraper original
from hentaila_scraper import (
    HttpClient, 
    scrape_all_catalog, 
    process_anime, 
    scrape_catalog_page,
    scrape_anime_detail,
    scrape_episode_providers,
    DEFAULT_CONCURRENCY
)

# ==========================================================
# FASE 1: SCRAPING COMPLETO (Todas las páginas)
# ==========================================================
async def run_full_scrape():
    """Ejecuta el scraping de todo el catálogo."""
    print("\n[FASE 1] INICIANDO SCRAPING COMPLETO DEL SITIO...")
    async with HttpClient(concurrency=DEFAULT_CONCURRENCY) as client:
        todos_animes = await scrape_all_catalog(client)
        if not todos_animes:
            print("[ERROR] No se pudo obtener el catálogo.")
            return

        total = len(todos_animes)
        LOTE = DEFAULT_CONCURRENCY

        print(f"[FASE 1] Animes detectados: {total}. Procesando...")

        animes_procesados = 0
        for i in range(0, total, LOTE):
            lote = todos_animes[i:i + LOTE]
            tareas = []
            for j, anime in enumerate(lote):
                idx_global = i + j + 1
                tareas.append(process_anime(client, anime, idx_global, total))

            resultados = await asyncio.gather(*tareas, return_exceptions=True)

            for r in resultados:
                if isinstance(r, Exception):
                    print(f"[ERROR] Falló un anime: {r}")
                    continue
                # Guardar el anime directamente en Turso
                await save_anime(r)
                animes_procesados += 1
                
            print(f"  -> Progreso: {animes_procesados}/{total} animes guardados en Turso.")
            
    print("[FASE 1] SCRAPING COMPLETO FINALIZADO.")

# ==========================================================
# FASE 2: ACTUALIZACIÓN CONTINUA (Páginas 1 y 2)
# ==========================================================
async def update_recent_catalog(pages_to_check=2):
    """Revisa solo las primeras páginas buscando nuevos animes o capítulos."""
    print("\n[FASE 2 - UPDATER] Buscando novedades en las páginas 1 y 2...")
    
    async with HttpClient(concurrency=DEFAULT_CONCURRENCY) as client:
        hubo_cambios = False
        
        for page in range(1, pages_to_check + 1):
            page_url = f"https://hentaila.com/catalogo?page={page}"
            animes_en_pagina = await scrape_catalog_page(client, page_url)
            
            for anime_catalog in animes_en_pagina:
                slug = anime_catalog["slug"]
                
                # Revisar si existe en la base de datos de Turso
                db_anime = await get_anime_full(slug)
                
                # CASO A: Anime totalmente nuevo
                if not db_anime:
                    print(f"  [+] Nuevo anime detectado: {slug}")
                    full_anime = await scrape_anime_detail(client, anime_catalog)
                    
                    for cap in full_anime["capitulos"]:
                        provs = await scrape_episode_providers(client, cap)
                        cap["proveedores"] = provs["embeds"]
                        cap["descargas"] = provs["downloads"]
                    
                    await save_anime(full_anime)
                    hubo_cambios = True
                    
                # CASO B: Anime existente, verificar si hay nuevos capítulos
                else:
                    current_details = await scrape_anime_detail(client, anime_catalog.copy())
                    old_caps_nums = set(await get_anime_chapters_numbers(slug))
                    
                    new_caps = [c for c in current_details["capitulos"] if c["numero"] not in old_caps_nums]
                    
                    if new_caps:
                        print(f"  [+] Nuevos capítulos para {slug}: {[c['numero'] for c in new_caps]}")
                        for cap in new_caps:
                            provs = await scrape_episode_providers(client, cap)
                            cap["proveedores"] = provs["embeds"]
                            cap["descargas"] = provs["downloads"]
                        
                        # Al guardar con save_anime, actualiza el header del anime y hace el insert/update de los caps nuevos
                        current_details["capitulos"] = new_caps # Pasamos solo los nuevos o todos, es igual por el ON CONFLICT
                        await save_anime(current_details)
                        hubo_cambios = True

    if hubo_cambios:
        print("[UPDATER] Cambios detectados y base de datos actualizada.")
    else:
        print("[UPDATER] Sin novedades en esta revisión.")

# ==========================================================
# ORQUESTADOR (TAREA EN SEGUNDO PLANO)
# ==========================================================
async def master_scraper_task():
    """Esta es la tarea maestra que decide qué hacer."""
    
    # Pausamos unos segundos al inicio para que el servidor levante bien.
    await asyncio.sleep(3)
    
    # Inicializar las tablas si no existen
    await init_db()
    
    # 1. Comprobar cuántos datos tiene Turso
    cantidad = await count_animes()
    
    # 2. Si hay menos de 50 animes, asumimos que falta el scraping inicial
    if cantidad < 50:
        await run_full_scrape()
    else:
        print(f"\n[INICIO] Base de datos existente detectada ({cantidad} animes). Saltando Fase 1.")
        
    # 3. Entrar en bucle infinito de Fase 2 (Mantenimiento)
    while True:
        try:
            await update_recent_catalog(pages_to_check=2)
        except Exception as e:
            print(f"[ERROR EN UPDATER] {e}")
        
        # Esperar 30 minutos (1800 segundos) para volver a revisar
        print("[ESPERA] Próxima revisión en 30 minutos...\n")
        await asyncio.sleep(1800)

# ==========================================================
# CONFIGURACIÓN DE LA API FASTAPI
# ==========================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar DB directamente al arrancar para evitar que fallen los requests iniciales
    await init_db()
    
    # Al encender la API, disparamos la Tarea Maestra en segundo plano
    task = asyncio.create_task(master_scraper_task())
    yield
    # Al apagar la API, cancelamos la tarea de scraping
    task.cancel()

app = FastAPI(title="Hentaila API Auto-Actualizable", lifespan=lifespan)

@app.get("/")
def home():
    return {"status": "online", "message": "API de Hentaila funcionando con Auto-Scraping hacia Turso."}

@app.get("/api/animes")
async def get_all_animes():
    """Endpoint para listar todos los animes del catálogo local."""
    data = await get_all_animes_basic()
    return data

@app.get("/api/animes/{slug}")
async def get_anime(slug: str):
    """Endpoint para ver todos los detalles de un anime específico, incluyendo los links de video."""
    anime = await get_anime_full(slug)
    if not anime:
        raise HTTPException(status_code=404, detail="Anime no encontrado en la base de datos")
    
    return anime

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
