#!/usr/bin/env node
/**
 * rewrite-zilla-urls.js
 *
 * Reescribe en Turso todas las URLs del player de zilla-networks:
 *   https://player.zilla-networks.com/play/<id>  ->  https://player.zilla-networks.com/m3u8/<id>
 *
 * Recorre TODAS las filas de la tabla `content` (no solo anime), parsea la
 * columna `details` (JSON), recorre `proveedores[*].url`, `proveedores[*].url_raw`,
 * `descargas[*].url` y `descargas[*].url_raw`, aplica la transformación y
 * guarda con UPDATE.
 *
 * Idempotente: si la URL ya está en /m3u8/ la deja igual.
 * Dry-run por defecto (DRY_RUN=1): no escribe, solo reporta.
 *
 * Variables de entorno (lee desde server/.dev.vars si existe):
 *   TURSO_DATABASE_URL
 *   TURSO_AUTH_TOKEN
 *
 * Uso:
 *   node server/scripts/rewrite-zilla-urls.js              # dry-run
 *   node server/scripts/rewrite-zilla-urls.js --apply     # aplica cambios
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = resolve(__dirname, '..');

// --- Cargar .dev.vars si existe ---
function loadDevVars() {
    const path = resolve(SERVER_DIR, '.dev.vars');
    try {
        const txt = readFileSync(path, 'utf8');
        for (const rawLine of txt.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) continue;
            const eq = line.indexOf('=');
            if (eq < 0) continue;
            const key = line.slice(0, eq).trim();
            let val = line.slice(eq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (process.env[key] === undefined) process.env[key] = val;
        }
    } catch {
        // archivo no existe, ok
    }
}
loadDevVars();

const URL_TURSO = process.env.TURSO_DATABASE_URL;
const TOKEN_TURSO = process.env.TURSO_AUTH_TOKEN;
if (!URL_TURSO || !TOKEN_TURSO) {
    console.error('Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN (definilos en server/.dev.vars o como env vars).');
    process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const ZILLA_RE = /^https?:\/\/player\.zilla-networks\.com\/play\/([A-Za-z0-9_-]+)\/?$/i;

function rewriteUrl(u) {
    if (typeof u !== 'string') return { value: u, changed: false };
    const m = u.match(ZILLA_RE);
    if (!m) return { value: u, changed: false };
    return {
        value: `https://player.zilla-networks.com/m3u8/${m[1]}`,
        changed: true,
    };
}

function rewriteProveedorList(list) {
    if (!Array.isArray(list)) return { changed: false };
    let changed = false;
    for (const p of list) {
        if (!p || typeof p !== 'object') continue;
        for (const k of ['url', 'url_raw']) {
            if (!(k in p)) continue;
            const { value, changed: c } = rewriteUrl(p[k]);
            if (c) {
                p[k] = value;
                changed = true;
            }
        }
    }
    return { changed };
}

function rewriteDetails(details) {
    if (!details || typeof details !== 'object') return false;
    let changed = false;

    // Forma 1: { capitulos: [ { proveedores, descargas, ... } ] }
    if (Array.isArray(details.capitulos)) {
        for (const cap of details.capitulos) {
            if (!cap || typeof cap !== 'object') continue;
            if (rewriteProveedorList(cap.proveedores).changed) changed = true;
            if (rewriteProveedorList(cap.descargas).changed) changed = true;
        }
    }

    // Forma 2: { anime: { temporadas: [ { capitulos: [ { proveedores, descargas } ] } ] } }
    const anime = details.anime;
    if (anime && Array.isArray(anime.temporadas)) {
        for (const temp of anime.temporadas) {
            if (!temp || !Array.isArray(temp.capitulos)) continue;
            for (const cap of temp.capitulos) {
                if (!cap || typeof cap !== 'object') continue;
                if (rewriteProveedorList(cap.proveedores).changed) changed = true;
                if (rewriteProveedorList(cap.descargas).changed) changed = true;
            }
        }
    }

    return changed;
}

async function main() {
    const db = createClient({ url: URL_TURSO, authToken: TOKEN_TURSO });
    console.log(`[rewrite-zilla-urls] Modo: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
    console.log(`[rewrite-zilla-urls] DB: ${URL_TURSO}`);

    const sel = await db.execute({
        sql: 'SELECT slug, content_type, details FROM content',
        args: [],
    });

    const rows = sel.rows;
    console.log(`[rewrite-zilla-urls] Filas leídas: ${rows.length}`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
        const slug = row.slug;
        const ctype = row.content_type;
        const rawDetails = row.details;
        if (rawDetails == null) { skipped++; continue; }

        let details;
        try {
            details = typeof rawDetails === 'string' ? JSON.parse(rawDetails) : rawDetails;
        } catch (e) {
            console.warn(`  ! ${slug} (${ctype}): JSON inválido, saltando`);
            skipped++;
            continue;
        }

        const changed = rewriteDetails(details);
        if (!changed) { skipped++; continue; }

        const newDetailsJson = JSON.stringify(details);
        if (APPLY) {
            try {
                await db.execute({
                    sql: 'UPDATE content SET details = ? WHERE slug = ? AND content_type = ?',
                    args: [newDetailsJson, slug, ctype],
                });
                updated++;
                console.log(`  + ${ctype}/${slug} actualizado`);
            } catch (e) {
                errors++;
                console.error(`  x ${ctype}/${slug}: error al actualizar: ${e.message}`);
            }
        } else {
            updated++;
            console.log(`  · ${ctype}/${slug} requeriría cambio`);
        }
    }

    console.log('');
    console.log(`[rewrite-zilla-urls] Resumen:`);
    console.log(`  Filas totales:       ${rows.length}`);
    console.log(`  A actualizar:        ${updated}`);
    console.log(`  Sin cambios:         ${skipped}`);
    console.log(`  Errores:             ${errors}`);
    if (!APPLY) {
        console.log(`  Modo DRY-RUN: ninguna fila fue modificada.`);
        console.log(`  Ejecutá con --apply para aplicar los cambios.`);
    } else {
        console.log(`  Cambios aplicados correctamente.`);
    }
}

main().catch((e) => {
    console.error('Error fatal:', e);
    process.exit(1);
});
