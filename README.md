# HQ

Panel de una sola persona para el día: tareas, presión, avisos, contenido y proyectos. Quien entra ve todos los datos. No está hecho para varias cuentas.

## Requisitos

- Node.js 24
- Postgres 16, o el Postgres embebido del script local

## Arranque local

```bash
npm install
cp .env.local.example .env.local
npm run db:embedded
```

En otra terminal:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Abre `http://localhost:3000` y entra con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

La clave de `.env.local.example` es solo para esa máquina. No la uses en un servidor.

Si prefieres Docker para la base local:

```bash
docker compose -f docker-compose.dev.yml up -d
```

En ese caso `DATABASE_URL` pasa a `postgresql://hq:hq@127.0.0.1:5433/hq`.

## Variables

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Conexión a Postgres |
| `AUTH_SECRET` | Firma de la sesión. `openssl rand -base64 32` |
| `AUTH_URL` | URL con la que se entra, sin barra final |
| `APP_URL` | La misma URL pública |
| `ADMIN_EMAIL` | Correo del primer usuario |
| `ADMIN_PASSWORD` | Clave del primer usuario. El seed no la cambia si el usuario ya existe |
| `HQ_API_TOKEN` | Clave del MCP. `openssl rand -hex 24`. No la subas |
| `PROXY_NETWORK` | Red Docker externa del proxy, solo en producción |

No subas `.env` ni `.env.local`.

## Producción

Mira [docs/DEPLOY.md](docs/DEPLOY.md).

## Licencia

MIT. Mira [LICENSE](LICENSE).
