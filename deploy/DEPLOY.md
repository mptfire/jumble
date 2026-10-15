# Deploying jumble.rtard.de

Static build, served by Caddy in a container on 127.0.0.1:8080. TLS terminates at the
reverse proxy already running on the VPS for rtard.de.

## One-time

1. **DNS** — add an A record: `jumble.rtard.de → 178.254.39.208`
2. **Reverse proxy** — append `deploy/Caddyfile.host-snippet` to the proxy config already
   serving rtard.de, then reload it (`caddy reload --config ...` or `systemctl reload caddy`).
   If the host proxy is nginx instead, use a server block for `jumble.rtard.de` proxying to
   `127.0.0.1:8080` with WebSocket upgrade headers.
3. **Start the container:**
   ```bash
   cd deploy && docker compose up -d --build
   ```
4. Verify: `curl -sI https://jumble.rtard.de` → 200, and the app loads with the relay picker
   showing `wss://relay.mypathtofire.de/` first.

## Relay configuration

`src/constants.ts` puts our relay first on every default list via `OWN_RELAY_URLS`
(`BIG_RELAY_URLS`, `DEFAULT_NOSTRCONNECT_RELAY`, `DEFAULT_DM_RELAYS`). If the strfry URL
changes, that one constant is the only place to touch, then rebuild.

## Updating

```bash
git pull
cd deploy && docker compose up -d --build   # rebuilds the image with the new dist
```

## Login guidance

Tell users (yourself included): do **not** log in with a raw `nsec` on the deployed site —
Jumble keeps it in localStorage, plaintext. Use a browser extension (NIP-07) or an NIP-46
bunker instead.

## Next steps (optional)

- **Blossom media server** at `blossom.rtard.de` so uploads stop going to nostr.build
  (see `DEFAULT_NIP_96_SERVICE` in `src/constants.ts` and the media-server defaults nearby).
- **Own bunker** for NIP-46 login so no key material lives in the browser.
