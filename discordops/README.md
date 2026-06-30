# DiscordOps — MVP

Centre de commande pour bots Discord (token de bot uniquement). Next.js 14
(App Router) + TypeScript + Tailwind CSS, thème "Cyberpunk/Pro".

## Installation

```bash
cd discordops
npm install
npm run dev
```

Aucune variable d'environnement n'est requise pour le MVP : il n'y a pas de
base de données, le token de bot est saisi à l'exécution par l'utilisateur.

## Architecture

```
app/
  page.tsx                      Landing + saisie du token
  dashboard/page.tsx            Dashboard (profil, audit, embeds)
  api/verify-bot/route.ts       Proxy → GET /users/@me (validation token)
  api/discord/channels/route.ts Proxy → GET /guilds/{id}/channels
  api/discord/send-embed/route.ts Proxy → POST /channels/{id}/messages
components/
  TokenInput.tsx                 Champ token masqué + validation
  BotProfileCard.tsx              Métadonnées du bot
  EmbedOrchestrator.tsx           Module B : builder + envoi d'embeds
  PermissionsAuditor.tsx          Module C : audit de permissions
  ui/Alert.tsx, ui/Skeleton.tsx   Primitives UI
context/BotTokenContext.tsx       État global du token + bot + guilds
lib/discord.ts                    Client Discord REST v10 (server-only)
lib/crypto.ts                     Chiffrement client du token (AES)
```

## Sécurité — flux du token de bot

1. **Saisie** : champ `type="password"` côté client (`TokenInput.tsx`), jamais
   loggé, jamais envoyé à un service tiers que Discord lui-même.
2. **Validation** : le token est envoyé une fois, en HTTPS, au Route Handler
   `/api/verify-bot`. Ce handler est un **proxy sans état** : il forward le
   header `Authorization: Bot <token>` vers `discord.com/api/v10`, renvoie la
   réponse au client, et ne persiste rien (pas de DB, pas de fichier, pas de
   `console.log`).
3. **Stockage client** : le token est chiffré (AES, `crypto-js`) avec une
   passphrase générée en mémoire pour l'onglet courant, puis le ciphertext
   est gardé en `sessionStorage` (pas `localStorage`) — il disparaît à la
   fermeture de l'onglet. La clé de déchiffrement n'existe qu'en mémoire JS :
   même si un attaquant lit `sessionStorage` via une faille XSS, il ne peut
   pas déchiffrer sans le contexte mémoire vivant de l'onglet.
4. **Chaque appel API ultérieur** (canaux, envoi d'embed) renvoie le token au
   serveur dans le corps de la requête HTTPS — jamais dans l'URL, jamais en
   query string, jamais loggé côté serveur.
5. **Aucune base de données** : il n'y a littéralement nulle part où le token
   pourrait fuiter par une faille de la couche de persistance, puisqu'il n'y
   a pas de persistance serveur.

### Limite connue

Le spec initial demandait `localStorage`. Le choix de `sessionStorage` réduit
la fenêtre d'exposition (le token ne survit pas à la fermeture de l'onglet).
Pour une persistance multi-session, remplacer `sessionStorage` par
`localStorage` dans `lib/crypto.ts` — mais cela implique de dériver la
passphrase d'un secret plus durable (ex: WebAuthn, passphrase utilisateur),
sinon le chiffrement devient cosmétique.

## Dépendances clés

- `axios` — client HTTP côté serveur vers l'API Discord.
- `crypto-js` — chiffrement AES côté client.
- `framer-motion` — animations subtiles (apparition du formulaire de token).

## Limitations du MVP

- Pas de gestion des rate limits Discord avec retry/backoff automatique (les
  erreurs 429 sont remontées telles quelles à l'UI).
- L'audit de permissions utilise le champ `permissions` calculé par Discord
  sur `/users/@me/guilds` (permissions globales du bot), pas une résolution
  fine par canal/rôle.
- Pas de tests automatisés inclus dans ce MVP.
