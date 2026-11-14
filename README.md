# Guía Staff: web con verificación desde Minecraft

Flujo: el jugador escribe `/verificar` en el juego, el plugin registra su nombre y una
contraseña de un solo uso en la web, el jugador los escribe en la página y pasa a `guia.html`.
Al verificarse, la web avisa a Discord y el bot puede consultar la lista.

## 1. Subir la web a Netlify
Las funciones necesitan instalarse con npm, así que usa el CLI o conecta un repositorio de GitHub
(arrastrar la carpeta en el panel NO instala las dependencias).

    npm install -g netlify-cli
    npm install
    netlify login
    netlify init          # crea el sitio
    netlify deploy --prod

## 2. Variables de entorno (Netlify → Site configuration → Environment variables)
| Variable | Para qué sirve |
|---|---|
| `API_SECRET` | Secreto largo que comparten la web, el plugin y el bot. Invéntalo (30+ caracteres). |
| `DISCORD_WEBHOOK_URL` | (Opcional) Webhook del canal donde avisar cada verificación. |

Después de crear las variables, vuelve a hacer `netlify deploy --prod`.

## 3. Plugin
En `plugins/UtilidadesPlus/config.yml` pon `web-url` (tu dirección de Netlify) y el mismo `api-secret`.
Reinicia el servidor.

## 4. Bot de Discord (opcional)
1. Crea una aplicación en https://discord.com/developers/applications y añade un Bot.
2. Copia el token, copia `bot/.env.example` a `bot/.env` y rellénalo.
3. Invita el bot con los scopes `bot` y `applications.commands`.
4. En la carpeta `bot/`: `npm install` y `npm start`.
5. En Discord usa `/verificados`.

## Editar la guía
El contenido está en `netlify/lib/guia.mjs`. Solo se envía a quien tenga sesión válida.

## Seguridad
- La contraseña se guarda con hash y salt, dura 10 minutos y es de un solo uso.
- Máximo 5 intentos por código.
- La sesión dura 24 horas; el contenido nunca está en el HTML público.
- No compartas `API_SECRET` ni lo subas a un repositorio público.
