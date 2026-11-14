// Lo usa el bot de Discord para saber quién se verificó
import { json, verificados, claveValida } from "../lib/util.mjs";

export default async (req) => {
  if (!claveValida(req)) return json({ error: "No autorizado" }, 401);

  const store = verificados();
  const { blobs } = await store.list();
  const lista = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  const ordenada = lista
    .filter(Boolean)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  return json({ total: ordenada.length, verificados: ordenada });
};

export const config = { path: "/api/verificados" };
