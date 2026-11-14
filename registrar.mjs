// Lo llama el plugin de Minecraft cuando un jugador escribe /verificar
import { json, pendientes, hash, nuevoToken, claveValida, limpiarNombre, leerJSON } from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  if (!claveValida(req)) return json({ error: "No autorizado" }, 401);

  const body = await leerJSON(req);
  if (!body) return json({ error: "JSON inválido" }, 400);

  const clave = limpiarNombre(body.nombre);
  const password = String(body.password || "");
  if (!clave || password.length < 6) return json({ error: "Datos inválidos" }, 400);

  const salt = nuevoToken(16);
  await pendientes().setJSON(clave, {
    nombre: String(body.nombre).slice(0, 16),
    salt,
    hash: hash(password, salt), // nunca se guarda la contraseña en claro
    expira: Date.now() + 10 * 60 * 1000, // 10 minutos
    intentos: 0,
  });

  return json({ ok: true });
};

export const config = { path: "/api/registrar" };
