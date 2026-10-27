# Deploying jumble.rtard.de / jumble.mptfire.de

Static build, served by Caddy in a container on 127.0.0.1:8080. TLS terminates at the
reverse proxy already running on the VPS for rtard.de.

**Alias live 2026-10-27:** `https://jumble.mptfire.de/` serves the same container (vhost in
the ecoblu edge Caddyfile; part of the mptfire.de rename, see
`~/Blitzwolf/dev/notes/mypathtofire-de-migration-list-2026-10-19.md`). Both hostnames stay
until the rename completes; client constants still point at rtard.de names because
relay/blossom.mptfire.de are pending a nostr-vps root task (vhost snippet in the same note).

## Access (reality check 2026-10-18)

- SSH: `ssh -i ~/.ssh/oracle_key billy@178.254.39.208` (host: ecoblu). The
  `id_ed25519_netcup_deploy` key is **not** valid on this host (root/deploy denied).
- No git on the VPS and no `.git` in the tree — updates are tarball swaps, not `git pull`.

## One-time

1. **DNS** — add an A record: `jumble.rtard.de → 178.254.39.208`
2. **Reverse proxy** — append `deploy/Caddyfile.host-snippet` to the proxy config already
   serving rtard.de, then reload it (`caddy reload --config ...` or `systemctl reload caddy`).
   If the host proxy is nginx instead, use a server block for `jumble.rtard.de` proxying to
   `127.0.0.1:8080` with WebSocket upgrade headers.
3. **Container network** — the compose file attaches to the shared `nitter-edge` network as
   `external: true`; create it if it doesn't exist yet (idempotent):
   ```bash
   docker network create nitter-edge 2>/dev/null || true
   ```
4. **Start the container:**
   ```bash
   cd deploy && docker compose up -d --build
   ```
5. Verify: `curl -sI https://jumble.rtard.de` → 200, and the app loads. Relay picker:
   visitors get the site default (`BIG_RELAY_URLS`, led by `wss://relay.mypathtofire.de/`);
   the owner's login seeds `OWNER_RELAY_URLS`, led by `wss://canoe.rtard.de/` (one-time per
   browser, only if the relay list was never customized).

## Relay configuration

Two constants in `src/constants.ts`, deliberately separate:

- `OWN_RELAY_URLS` (the personal strfry) — spliced first into every **site-wide** default
  (`BIG_RELAY_URLS`, `DEFAULT_NOSTRCONNECT_RELAY`, `DEFAULT_DM_RELAYS`). If the strfry URL
  changes, that one constant is the only place to touch, then rebuild.
- `OWNER_RELAY_URLS` — the **owner's** login seed set (canoe first, then strfry + active
  relays), written once per browser on owner login. Not used for site defaults.

## Updating (tarball swap)

```bash
curl -sSL -o /tmp/jumble.tar.gz https://api.github.com/repos/mptfire/jumble/tarball/deploy/rtard-de
scp -i ~/.ssh/oracle_key /tmp/jumble.tar.gz billy@178.254.39.208:
ssh -i ~/.ssh/oracle_key billy@178.254.39.208
mv ~/jumble ~/jumble.old-$(date +%Y%m%d%H%M)   # keep for rollback
mkdir ~/jumble && tar -xzf ~/jumble.tar.gz -C ~/jumble --strip-components=1
cd ~/jumble/deploy && docker compose up -d --build
```

Verify: etag in `curl -sI https://jumble.rtard.de` changes; container `Up`.
Alternative: install git on ecoblu and restore the plain `git pull` flow.

## Login guidance

Tell users (yourself included): do **not** log in with a raw `nsec` on the deployed site —
Jumble keeps it in localStorage, plaintext. Use a browser extension (NIP-07) or an NIP-46
bunker instead.

## Next steps (optional)

- **NIP-96 uploader decision (open, F3):** `DEFAULT_NIP_96_SERVICE` is still `nostr.build`
  (third party). Blossom is the default upload path and is already handled — site default is
  public mirrors (`RECOMMENDED_BLOSSOM_SERVERS`), the owner's npub overrides to personal
  servers (`OWNER_BLOSSOM_SERVERS` = canoe + blossom.mypathtofire.de). Remaining choice: keep
  nostr.build for the rare explicit NIP-96 path, or stand up a NIP-96 endpoint on our infra.
- **Own bunker** for NIP-46 login so no key material lives in the browser.
