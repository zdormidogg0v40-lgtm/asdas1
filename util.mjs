import { getStore } from "@netlify/blobs";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export const pendientes = () => getStore("pendientes");
export const sesiones = () => getStore("sesiones");
export const verificados = () => getStore("verificados");

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export const nuevoToken = (bytes = 32) => randomBytes(bytes).toString("hex");
export const hash = (password, salt) =>
  createHash("sha256").update(salt + password).digest("hex");

export function igual(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && timingSafeEqual(A, B);
}

// Solo el plugin y el bot conocen API_SECRET
export function claveValida(req) {
  const secreto = process.env.API_SECRET;
  const recibida = req.headers.get("x-api-key") || "";
  return Boolean(secreto) && igual(recibida, secreto);
}

// Los nombres de Minecraft son letras, números y guion bajo (máx. 16)
export const limpiarNombre = (n) =>
  String(n || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16);

export async function leerJSON(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// Avisa al canal de Discord mediante un webhook (opcional)
export async function avisarDiscord(texto) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "✅ Nueva verificación",
            description: texto,
            color: 0x8b5cf6,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch {
    /* si Discord falla, la verificación sigue funcionando */
  }
}
