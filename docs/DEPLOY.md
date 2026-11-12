# Deploy

HQ no abre el 80 ni el 443. Un proxy inverso delante enruta el dominio hacia el contenedor `hq-web`, que escucha en el puerto 3000.

## Primera vez

```bash
git clone <url-del-repo> /opt/hq
cd /opt/hq
cp .env.example .env
```

Rellena `APP_URL`, `AUTH_SECRET` (`openssl rand -base64 32`), `POSTGRES_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` y `PROXY_NETWORK`.

`PROXY_NETWORK` es el nombre de una red Docker externa. Puedes crear una:

```bash
docker network create hq_proxy
```

y poner `PROXY_NETWORK=hq_proxy`. Si ya tienes un proxy en otra red, usa el nombre de esa red.

```bash
docker compose up -d --build
```

El proxy debe enviar el tráfico del dominio al contenedor `hq-web` en el puerto 3000. `APP_URL` y `AUTH_URL` son esa URL pública, sin barra final.

## Desarrollo local

```bash
cp .env.local.example .env.local
npm run db:embedded
# en otra terminal:
npm run db:migrate
npm run db:seed
npm run dev
```

O solo la base, si tienes Docker:

```bash
docker compose -f docker-compose.dev.yml up -d
```

`DATABASE_URL` de `.env.local.example` apunta al Postgres embebido (puerto 54330). Si usas Docker local, cámbiala a `postgresql://hq:hq@127.0.0.1:5433/hq`.

## Copias

```bash
cd /opt/hq
bash scripts/backup-pg.sh
```

Un cron diario puede llamar a ese script. Conserva 14 días.
