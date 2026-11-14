// Entrega el contenido de la guía solo si el token de sesión es válido
import { json, sesiones } from "../lib/util.mjs";
import { SECCIONES } from "../lib/guia.mjs";

export default async (req) => {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!/^[a-f0-9]{64}$/.test(token)) return json({ error: "Sin sesión" }, 401);

  const store = sesiones();
  const sesion = await store.get(token, { type: "json" });
  if (!sesion) return json({ error: "Sesión inválida" }, 401);
  if (Date.now() > sesion.expira) {
    await store.delete(token);
    return json({ error: "Sesión expirada" }, 401);
  }

  return json({ nombre: sesion.nombre, secciones: SECCIONES });
};

export const config = { path: "/api/guia" };
