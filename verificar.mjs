// Lo llama la página cuando el jugador envía su nombre y contraseña
import {
  json, pendientes, sesiones, verificados, hash, igual, nuevoToken,
  limpiarNombre, leerJSON, avisarDiscord,
} from "../lib/util.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const body = await leerJSON(req);
  if (!body) return json({ error: "JSON inválido" }, 400);

  const clave = limpiarNombre(body.nombre);
  const password = String(body.password || "");
  const fallo = { error: "Nombre o contraseña incorrectos, o el código ya expiró." };
  if (!clave || !password) return json(fallo, 401);

  const store = pendientes();
  const reg = await store.get(clave, { type: "json" });
  if (!reg) return json(fallo, 401);

  if (Date.now() > reg.expira) {
    await store.delete(clave);
    return json(fallo, 401);
  }
  if (reg.intentos >= 5) {
    await store.delete(clave);
    return json({ error: "Demasiados intentos. Escribe /verificar otra vez en el juego." }, 429);
  }
  if (!igual(hash(password, reg.salt), reg.hash)) {
    reg.intentos += 1;
    await store.setJSON(clave, reg);
    return json(fallo, 401);
  }

  // Correcto: la contraseña es de un solo uso
  await store.delete(clave);

  const token = nuevoToken(32);
  await sesiones().setJSON(token, {
    nombre: reg.nombre,
    expira: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  });
  await verificados().setJSON(clave, {
    nombre: reg.nombre,
    fecha: new Date().toISOString(),
  });
  await avisarDiscord(`**${reg.nombre}** se verificó correctamente en la página.`);

  return json({ ok: true, token, nombre: reg.nombre });
};

export const config = { path: "/api/verificar" };
