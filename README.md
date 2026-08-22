# Little Loveseat

Frameless pixel desktop widget for people you love. Characters sit together in a room, send tiny notes or love, and grow into family or lovers.

## Spec
- No native window chrome
- Character creation
- Online rooms (local Socket.io hearth)
- Always on top
- Sit in a seat when you join
- Short messages or love, with a **5 minute** wait between sends
- Relationship levels: Stranger → Friend → Close → Family → Lover
- Pixel art

## Run

```bash
npm install
npm start
```

Open the app twice (two seats on the same machine) or share room code `hearth` with a teammate on the same computer.

Optional dedicated server:

```bash
npm run server
```

To try interactions faster while building, set `LOVESEAT_COOLDOWN_MS=10000` before `npm start`.
