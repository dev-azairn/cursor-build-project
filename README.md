# Little Loveseat

Frameless pixel desktop widget for people you love. Characters sit together in a room, send tiny notes or love, and grow into family or lovers.

## Spec
- No native window chrome
- Character creation
- Multiplayer rooms over LAN or a deployed server
- Always on top
- Sit in a seat when you join
- Short messages or love, with a **5 minute** wait between sends
- Relationship levels: Stranger → Friend → Close → Family → Lover
- Pixel art

## Run the widget

```bash
npm install
npm start
```

## Multiplayer

Everyone must use the **same room code** and the **same server URL**.

| Mode | Server URL | Who can join |
| --- | --- | --- |
| This PC | `http://127.0.0.1:3847` | Two windows on one computer |
| LAN | `http://YOUR_LAN_IP:3847` | Friends on the same wifi |
| Cloud | `https://your-app.onrender.com` | Anyone on the internet |

In the widget, open **ROOM**:

- **THIS PC** — local hearth
- **LAN** — fills your wifi address so others can paste it
- **COPY** — copies `server URL` + `room:code`
- Paste a deployed HTTPS URL for internet play

Allow Node/Electron through the firewall if LAN joins fail.

Dedicated local server:

```bash
npm run server
```

Point other widgets at `http://HOST_LAN_IP:3847`.

To skip hosting a local hearth and only join a cloud server:

```powershell
$env:LOVESEAT_SERVER_URL="https://your-app.onrender.com"
npm start
```

Faster interaction testing: `$env:LOVESEAT_COOLDOWN_MS=10000` before `npm start`.

## Deploy the multiplayer server

Socket rooms need a long-running Node process (`PORT` is read automatically). Vercel serverless is not used for this.

### Render

1. Push this repo to GitHub.
2. New Web Service → this repo, or `render.yaml`.
3. Build `npm ci --omit=dev`, start `node server/index.js`.
4. Open `https://YOUR-SERVICE.onrender.com/health` — should return `{ "ok": true }`.
5. In the widget **ROOM** field, paste that HTTPS URL.

### Railway / Fly / any Docker host

```bash
docker build -t little-loveseat .
docker run -p 3847:3847 -e PORT=3847 little-loveseat
```

`Procfile` is included for Railway/Heroku-style platforms.
