# Little Loveseat

A frameless pixel desktop widget. People you love sit on the same couch.

Same **room code** + same **server URL** = you sit together.

## Run locally

```bash
npm install
npm start            # desktop widget (hosts a hearth on port 3847)
npm run server       # hearth only — open http://127.0.0.1:3847 in a browser
```

On another laptop on the same Wi-Fi: ROOM → LAN (or paste `http://<your-lan-ip>:3847`) and use the same room code.

Point the widget at a deployed hearth:

```bash
LOVESEAT_SERVER_URL=https://your-app.onrender.com npm start
```

## Deploy (one URL for the game + sockets)

Prefer a **single Node process** so everyone shares the in-memory room: Render, Railway, Fly, or Docker. `PORT` is read automatically. Health check: `/health`.

- **Render:** this repo’s `render.yaml` (`npm ci --omit=dev` + `node server/index.js`)
- **Railway:** `railway.json` start command is `node server/index.js`
- **Fly:** `fly launch` using the Dockerfile
- **Docker:** `docker build -t little-loveseat . && docker run -p 3847:3847 little-loveseat`

Vercel can host the page plus a Socket.IO function (`api/socket-io.js`, websocket-only). Shared rooms are more reliable on Render/Railway/Fly because all seats live in one process.

After deploy, friends open the https URL (or paste it into ROOM → Server URL) and use the same room code. COPY makes an invite like `https://…/?room=hearth`.
